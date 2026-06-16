"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAgentsForCountry,
  getBanksForCountry,
  getCountryForCurrency,
  travelCountries,
} from "@/lib/data/exchangeProviders";
import {
  formatCurrency,
  formatRate,
  getMidRate,
  quoteProvider,
  rankProviderQuotes,
} from "@/lib/currency";
import { ProviderQuote } from "@/lib/types";
import TabSwitcher from "@/components/ui/TabSwitcher";
import StatusBar from "@/components/ui/StatusBar";
import ProviderRateSnipeModal from "@/components/sniper/ProviderRateSnipeModal";

interface TravelRatePanelProps {
  from: string;
  to: string;
  amount: number;
  onHuntStarted: (name: string) => void;
}

const tabs = [
  { id: "banks", label: "Top 10 Banks" },
  { id: "agents", label: "Exchange Agents" },
];

export default function TravelRatePanel({
  from,
  to,
  amount,
  onHuntStarted,
}: TravelRatePanelProps) {
  const destination = getCountryForCurrency(to);
  const [countryCode, setCountryCode] = useState(destination?.code ?? "TH");

  useEffect(() => {
    const country = getCountryForCurrency(to);
    if (country) setCountryCode(country.code);
  }, [to]);
  const [activeTab, setActiveTab] = useState("banks");
  const [cityFilter, setCityFilter] = useState("");
  const [snipeQuote, setSnipeQuote] = useState<ProviderQuote | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const selectedCountry =
    travelCountries.find((c) => c.code === countryCode) ?? destination;

  const bankQuotes = useMemo(() => {
    const banks = getBanksForCountry(countryCode);
    return rankProviderQuotes(
      banks.map((b) => quoteProvider(amount, from, to, b))
    );
  }, [countryCode, amount, from, to]);

  const agentQuotes = useMemo(() => {
    const agents = getAgentsForCountry(countryCode).filter(
      (a) =>
        !cityFilter ||
        a.city?.toLowerCase().includes(cityFilter.toLowerCase())
    );
    return rankProviderQuotes(
      agents.map((a) => quoteProvider(amount, from, to, a))
    );
  }, [countryCode, amount, from, to, cityFilter]);

  const quotes = activeTab === "banks" ? bankQuotes : agentQuotes;
  const midRate = getMidRate(from, to);
  const best = quotes[0];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 600);
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="section-title mb-1">Traveler rates</p>
          <h3 className="font-semibold text-slate-900 tracking-tight">
            Local rates in {selectedCountry?.flag} {selectedCountry?.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Sniper Bot scans top banks and licensed exchange agents for the best{" "}
            {from} → {to} rate on the ground.
          </p>
        </div>
        <button onClick={handleScan} className="btn-teal shrink-0">
          🔍 Scan rates
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="field-label">Traveling to</label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="input-modern w-full"
          >
            {travelCountries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.currency})
              </option>
            ))}
          </select>
        </div>
        {activeTab === "agents" && (
          <div>
            <label className="field-label">City filter</label>
            <input
              type="text"
              placeholder="e.g. Bangkok, Tokyo"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="input-modern w-full"
            />
          </div>
        )}
      </div>

      <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="rounded-xl p-3.5 bg-hub-teal-light/40 border border-hub-teal/10 text-sm flex flex-wrap gap-x-6 gap-y-1">
        <span className="text-slate-500">
          Mid-market:{" "}
          <strong className="text-slate-700">{formatRate(midRate, from, to)}</strong>
        </span>
        {best && (
          <span className="text-hub-teal font-medium">
            Best {activeTab === "banks" ? "bank" : "agent"}: {best.provider.name}{" "}
            · {formatCurrency(best.outputAmount, to)}
          </span>
        )}
      </div>

      <StatusBar
        status={isScanning ? "thinking" : "idle"}
        message={
          isScanning
            ? `Scanning ${quotes.length} ${activeTab === "banks" ? "banks" : "agents"}...`
            : `${quotes.length} ${activeTab === "banks" ? "bank" : "agent"} rates found`
        }
      />

      <div className="space-y-2">
        {quotes.map((q) => (
          <ProviderRateRow
            key={q.provider.id}
            quote={q}
            from={from}
            to={to}
            amount={amount}
            onSnipe={() => setSnipeQuote(q)}
          />
        ))}
      </div>

      {quotes.length === 0 && (
        <div className="empty-state text-sm">
          No exchange agents match your city filter.
        </div>
      )}

      {snipeQuote && (
        <ProviderRateSnipeModal
          quote={snipeQuote}
          from={from}
          to={to}
          amount={amount}
          onClose={() => setSnipeQuote(null)}
          onHuntStarted={onHuntStarted}
        />
      )}
    </div>
  );
}

function ProviderRateRow({
  quote,
  from,
  to,
  amount,
  onSnipe,
}: {
  quote: ProviderQuote;
  from: string;
  to: string;
  amount: number;
  onSnipe: () => void;
}) {
  const { provider, outputAmount, effectiveRate, spreadPercent, rank } = quote;
  const isBest = rank === 1;

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isBest
          ? "border-hub-teal/25 bg-hub-teal-light/30"
          : "border-slate-100 bg-slate-50/50"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`icon-box w-10 h-10 text-sm shrink-0 ${
            provider.type === "bank" ? "bg-hub-blue-light/60" : "bg-hub-amber-light/60"
          }`}
        >
          {provider.type === "bank" ? "🏦" : "💵"}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm text-slate-900 truncate">
              {provider.name}
            </p>
            {isBest && (
              <span className="badge-pill bg-hub-teal-light/80 text-hub-teal border-hub-teal/20 !normal-case !tracking-normal">
                Best rate
              </span>
            )}
            <span className="text-xs text-slate-400">#{rank}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {provider.type === "bank" ? provider.branches : `${provider.city} · ${provider.hours}`}
          </p>
          <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500">
            <span>{formatRate(effectiveRate, from, to)}</span>
            <span className="text-slate-300">·</span>
            <span>{spreadPercent.toFixed(2)}% spread</span>
            {provider.rating > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span>★ {provider.rating}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-bold text-hub-teal text-sm">
            {formatCurrency(outputAmount, to)}
          </p>
          <p className="text-[11px] text-slate-400">for {amount.toLocaleString()} {from}</p>
        </div>
        <button onClick={onSnipe} className="btn-primary !py-1.5 !px-3 !text-xs !rounded-lg">
          🎯 Snipe
        </button>
      </div>
    </div>
  );
}
