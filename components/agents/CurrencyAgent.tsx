"use client";

import { useState, useMemo } from "react";
import { currencies } from "@/lib/data/currencies";
import { convertCurrency, formatCurrency } from "@/lib/currency";
import AIChat, { useAIResponse } from "@/components/ui/AIChat";
import StatusBar from "@/components/ui/StatusBar";
import SniperBanner from "@/components/sniper/SniperBanner";
import SnipeSuccess from "@/components/sniper/SnipeSuccess";
import HuntStatusPanel from "@/components/sniper/HuntStatusPanel";
import RateSnipeModal from "@/components/sniper/RateSnipeModal";
import TravelRatePanel from "@/components/agents/currency/TravelRatePanel";
import { useSniperState } from "@/components/sniper/useSniperState";

export default function CurrencyAgent() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("THB");
  const [showRateSnipe, setShowRateSnipe] = useState(false);
  const { huntRefreshKey, snipeSuccess, onHuntStarted } = useSniperState();
  const { response, isLoading } = useAIResponse();

  const converted = useMemo(
    () => convertCurrency(amount, from, to),
    [amount, from, to]
  );

  const compareGrid = useMemo(() => {
    const targets = ["EUR", "GBP", "JPY", "AUD", "CAD", "THB"];
    return targets.map((code) => ({
      code,
      amount: convertCurrency(amount, from, code),
      info: currencies.find((c) => c.code === code)!,
    }));
  }, [amount, from]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="space-y-6">
      <SniperBanner
        accent="teal"
        title="Rate Sniper Bot"
        description="Scan top 10 banks and local exchange agents in your destination country. Snipe the best on-the-ground rate — or set a mid-market alert."
      />

      {snipeSuccess && <SnipeSuccess message={snipeSuccess} />}

      <HuntStatusPanel refreshKey={huntRefreshKey} />

      <div className="glass-panel p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div>
            <label className="field-label">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full input-modern"
            />
          </div>
          <button
            onClick={swap}
            className="btn-secondary !p-2.5 self-end"
            title="Swap currencies"
          >
            ⇄
          </button>
          <div className="hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="field-label">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full input-modern"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">To (destination)</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full input-modern"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-center bg-gradient-to-br from-hub-teal-light/80 to-white border border-hub-teal/10 shadow-sm">
          <p className="text-sm text-slate-400 font-medium">
            {amount.toLocaleString()} {from} =
          </p>
          <p className="text-4xl font-bold tracking-tight text-hub-teal mt-2">
            {formatCurrency(converted, to)}
          </p>
          <p className="text-xs text-slate-400 mt-2">Mid-market reference rate</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowRateSnipe(true)} className="btn-teal">
            🎯 Snipe Mid-Market Rate
          </button>
        </div>

        <StatusBar status="idle" message="Rates updated statically (USD base)" />
      </div>

      <TravelRatePanel
        from={from}
        to={to}
        amount={amount}
        onHuntStarted={onHuntStarted}
      />

      <div>
        <p className="section-title mb-1">At a glance</p>
        <h3 className="font-semibold text-slate-900 tracking-tight mb-4">
          Quick Compare
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {compareGrid.map((item) => (
            <button
              key={item.code}
              onClick={() => setTo(item.code)}
              className={`compare-tile ${to === item.code ? "compare-tile-active" : ""}`}
            >
              <div className="text-xl">{item.info.flag}</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                {item.code}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {item.amount.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {response && (
        <div className="glass-panel p-5 border-hub-purple/15 bg-hub-purple-light/30">
          <StatusBar status={isLoading ? "thinking" : "idle"} />
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-2">
            {response}
          </p>
        </div>
      )}

      <AIChat
        title="Forex AI Assistant"
        placeholder="Ask about exchange rates, travel money tips..."
        quickAsks={[
          "Best bank to exchange in Bangkok?",
          "Bank vs money changer in Japan?",
          "How does provider rate sniping work?",
        ]}
        systemContext="You are a currency and forex expert for AgentHub's Currency Exchange agent. It scans top 10 banks and local exchange agents per country and integrates with Ticket Sniper Bot for rate alerts on specific providers."
      />

      {showRateSnipe && (
        <RateSnipeModal
          from={from}
          to={to}
          amount={amount}
          onClose={() => setShowRateSnipe(false)}
          onHuntStarted={onHuntStarted}
        />
      )}
    </div>
  );
}
