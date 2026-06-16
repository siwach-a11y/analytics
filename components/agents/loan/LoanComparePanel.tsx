"use client";

import { useMemo, useState } from "react";
import {
  getLoanProvidersForCountry,
  loanCountries,
} from "@/lib/data/loanProviders";
import { LoanQuote } from "@/lib/types";
import {
  formatApr,
  formatMoney,
  quoteLoan,
  rankLoanQuotes,
} from "@/lib/loans";
import TabSwitcher from "@/components/ui/TabSwitcher";
import StatusBar from "@/components/ui/StatusBar";
import LoanRateSnipeModal from "@/components/sniper/LoanRateSnipeModal";

interface LoanComparePanelProps {
  amount: number;
  termMonths: number;
  creditScore: number;
  countryCode: string;
  onCountryChange: (code: string) => void;
  onHuntStarted: (name: string) => void;
}

const tabs = [
  { id: "all", label: "All Lenders" },
  { id: "bank", label: "Banks" },
  { id: "fintech", label: "Fintech" },
  { id: "credit_union", label: "Credit Unions" },
];

const typeIcon: Record<string, string> = {
  bank: "🏦",
  fintech: "📱",
  credit_union: "🤝",
};

export default function LoanComparePanel({
  amount,
  termMonths,
  creditScore,
  countryCode,
  onCountryChange,
  onHuntStarted,
}: LoanComparePanelProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [isScanning, setIsScanning] = useState(false);
  const [snipeQuote, setSnipeQuote] = useState<LoanQuote | null>(null);

  const country =
    loanCountries.find((c) => c.code === countryCode) ?? loanCountries[0];

  const quotes = useMemo(() => {
    const providers = getLoanProvidersForCountry(countryCode);
    const filtered =
      activeTab === "all"
        ? providers
        : providers.filter((p) => p.type === activeTab);

    const raw = filtered
      .map((p) => quoteLoan(p, amount, termMonths, creditScore))
      .filter((q): q is LoanQuote => q !== null);

    return rankLoanQuotes(raw);
  }, [countryCode, amount, termMonths, creditScore, activeTab]);

  const best = quotes[0];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 600);
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="section-title mb-1">Rate comparison</p>
          <h3 className="font-semibold text-slate-900 tracking-tight">
            Personal loan rates in {country.flag} {country.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Compare APR, monthly payment, and total interest across banks,
            fintech lenders, and credit unions.
          </p>
        </div>
        <button onClick={handleScan} className="btn-teal shrink-0">
          🔍 Compare rates
        </button>
      </div>

      <div>
        <label className="field-label">Country</label>
        <select
          value={countryCode}
          onChange={(e) => onCountryChange(e.target.value)}
          className="input-modern w-full sm:max-w-xs"
        >
          {loanCountries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {best && (
        <div className="rounded-xl p-3.5 bg-white/90 border border-white shadow-sm text-sm flex flex-wrap gap-x-6 gap-y-1">
          <span className="text-slate-500">
            Best rate:{" "}
            <strong className="text-hub-teal">{best.provider.name}</strong> ·{" "}
            {formatApr(best.apr)}
          </span>
          <span className="text-slate-500">
            Monthly:{" "}
            <strong className="text-slate-700">
              {formatMoney(best.monthlyPayment, country.currency)}
            </strong>
          </span>
          <span className="text-slate-500">
            Total interest:{" "}
            <strong className="text-slate-700">
              {formatMoney(best.totalInterest, country.currency)}
            </strong>
          </span>
        </div>
      )}

      <StatusBar
        status={isScanning ? "thinking" : "idle"}
        message={
          isScanning
            ? `Scanning lenders in ${country.name}...`
            : `${quotes.length} loan offers compared`
        }
      />

      <div className="space-y-2">
        {quotes.map((q) => (
          <LoanQuoteRow
            key={q.provider.id}
            quote={q}
            currency={country.currency}
            onSnipe={() => setSnipeQuote(q)}
          />
        ))}
      </div>

      {quotes.length === 0 && (
        <div className="empty-state text-sm">
          No lenders match your amount, term, or credit score. Try adjusting your
          inputs.
        </div>
      )}

      {snipeQuote && (
        <LoanRateSnipeModal
          quote={snipeQuote}
          amount={amount}
          termMonths={termMonths}
          creditScore={creditScore}
          onClose={() => setSnipeQuote(null)}
          onHuntStarted={onHuntStarted}
        />
      )}
    </div>
  );
}

function LoanQuoteRow({
  quote,
  currency,
  onSnipe,
}: {
  quote: LoanQuote;
  currency: string;
  onSnipe: () => void;
}) {
  const { provider, apr, monthlyPayment, totalInterest, originationFee, rank } =
    quote;
  const isBest = rank === 1;

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isBest
          ? "border-hub-teal/25 bg-white shadow-sm ring-1 ring-hub-teal/15"
          : "border-white/80 bg-white/90"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="icon-box w-10 h-10 text-sm shrink-0">
          {typeIcon[provider.type] ?? "💰"}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm text-slate-900 truncate">
              {provider.name}
            </p>
            {isBest && (
              <span className="badge-pill bg-hub-teal-light/80 text-hub-teal border-hub-teal/20 !normal-case !tracking-normal">
                Lowest APR
              </span>
            )}
            <span className="text-xs text-slate-400">#{rank}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">
            {provider.type.replace("_", " ")} · ★ {provider.rating}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {provider.features.slice(0, 2).map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded-md bg-lime-50 text-hub-teal font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right text-sm">
          <p className="font-bold text-hub-teal">{formatApr(apr)}</p>
          <p className="text-slate-600 font-medium">
            {formatMoney(monthlyPayment, currency)}/mo
          </p>
          <p className="text-[11px] text-slate-400">
            {formatMoney(totalInterest, currency)} interest
            {originationFee > 0
              ? ` · ${formatMoney(originationFee, currency)} fee`
              : ""}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={onSnipe}
            className="btn-primary !py-1.5 !px-3 !text-xs !rounded-lg"
          >
            🎯 Snipe Rate
          </button>
          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !py-1.5 !px-3 !text-xs !rounded-lg text-center"
          >
            Apply
          </a>
        </div>
      </div>
    </div>
  );
}
