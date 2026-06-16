"use client";

import { useMemo, useState } from "react";
import { loanPurposes } from "@/lib/data/loanProviders";
import {
  formatApr,
  formatMoney,
  monthlyPayment,
  quoteLoan,
  rankLoanQuotes,
} from "@/lib/loans";
import { getLoanProvidersForCountry } from "@/lib/data/loanProviders";
import AIChat, { useAIResponse } from "@/components/ui/AIChat";
import StatusBar from "@/components/ui/StatusBar";
import SniperBanner from "@/components/sniper/SniperBanner";
import SnipeSuccess from "@/components/sniper/SnipeSuccess";
import HuntStatusPanel from "@/components/sniper/HuntStatusPanel";
import LoanComparePanel from "@/components/agents/loan/LoanComparePanel";
import { useSniperState } from "@/components/sniper/useSniperState";

const termOptions = [12, 24, 36, 48, 60, 72, 84];

export default function PersonalLoanAgent() {
  const [amount, setAmount] = useState(15000);
  const [termMonths, setTermMonths] = useState(36);
  const [creditScore, setCreditScore] = useState(720);
  const [purpose, setPurpose] = useState("All");
  const [countryCode, setCountryCode] = useState("US");
  const { huntRefreshKey, snipeSuccess, onHuntStarted } = useSniperState();
  const { response, isLoading } = useAIResponse();

  const currency =
    countryCode === "GB"
      ? "GBP"
      : countryCode === "TH"
        ? "THB"
        : countryCode === "AU"
          ? "AUD"
          : "USD";

  const quickSummary = useMemo(() => {
    const quotes = rankLoanQuotes(
      getLoanProvidersForCountry(countryCode)
        .map((p) => quoteLoan(p, amount, termMonths, creditScore))
        .filter((q) => q !== null)
    );
    const best = quotes[0];
    const avgApr =
      quotes.length > 0
        ? quotes.reduce((s, q) => s + q.apr, 0) / quotes.length
        : 0;
    return { best, avgApr, count: quotes.length };
  }, [amount, termMonths, creditScore, countryCode]);

  const estimatePayment = useMemo(
    () => monthlyPayment(amount, quickSummary.best?.apr ?? 10, termMonths),
    [amount, termMonths, quickSummary.best]
  );

  return (
    <div className="space-y-6">
      <SniperBanner
        accent="teal"
        title="Loan Rate Sniper Bot"
        description="Compare personal loan APRs from banks, fintech lenders, and credit unions. Snipe your target rate and get alerted when a better offer appears."
      />

      {snipeSuccess && <SnipeSuccess message={snipeSuccess} />}
      <HuntStatusPanel refreshKey={huntRefreshKey} />

      <div className="glass-panel p-5 space-y-4">
        <p className="section-title">Loan calculator</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="field-label">Loan amount</label>
            <input
              type="number"
              min={1000}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input-modern w-full"
            />
          </div>
          <div>
            <label className="field-label">Term (months)</label>
            <select
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="input-modern w-full"
            >
              {termOptions.map((t) => (
                <option key={t} value={t}>
                  {t} months ({Math.round(t / 12)} yr)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Credit score</label>
            <input
              type="number"
              min={300}
              max={850}
              value={creditScore}
              onChange={(e) => setCreditScore(Number(e.target.value))}
              className="input-modern w-full"
            />
          </div>
          <div>
            <label className="field-label">Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="input-modern w-full"
            >
              {loanPurposes.map((p) => (
                <option key={p} value={p}>
                  {p === "All" ? "Any purpose" : p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="stat-card !p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Best APR
            </p>
            <p className="text-xl font-bold text-hub-teal mt-1">
              {quickSummary.best
                ? formatApr(quickSummary.best.apr)
                : "—"}
            </p>
          </div>
          <div className="stat-card !p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Est. monthly
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {formatMoney(estimatePayment, currency)}
            </p>
          </div>
          <div className="stat-card !p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Avg market APR
            </p>
            <p className="text-xl font-bold text-slate-700 mt-1">
              {quickSummary.count > 0
                ? formatApr(quickSummary.avgApr)
                : "—"}
            </p>
          </div>
          <div className="stat-card !p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              Lenders
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {quickSummary.count}
            </p>
          </div>
        </div>
      </div>

      <LoanComparePanel
        amount={amount}
        termMonths={termMonths}
        creditScore={creditScore}
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        onHuntStarted={onHuntStarted}
      />

      {response && (
        <div className="glass-panel p-5">
          <StatusBar status={isLoading ? "thinking" : "idle"} />
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-2">
            {response}
          </p>
        </div>
      )}

      <AIChat
        title="Loan AI Assistant"
        placeholder="Ask about rates, lenders, or debt consolidation..."
        quickAsks={[
          `Best personal loan for ${creditScore} credit score?`,
          "SoFi vs LightStream — which is better?",
          "How to snipe a lower APR?",
        ]}
        systemContext={`You are a personal finance expert for AgentHub's Personal Loan Finder. User is comparing ${formatMoney(amount, currency)} over ${termMonths} months with credit score ${creditScore}. Purpose: ${purpose}. Help compare APRs, monthly payments, and lender features. Mention Loan Rate Sniper for monitoring target rates.`}
      />
    </div>
  );
}
