"use client";

import { useMemo, useState } from "react";
import { convertCurrency, formatRate, getMidRate } from "@/lib/currency";
import { createHunt, ensureUser, startHunt } from "@/lib/ticket-sniper/client";
import { providerRateToHuntPayload } from "@/lib/ticket-sniper/payloads";
import { ProviderQuote } from "@/lib/types";
import { calculateSnipeFee, snipeValueToUsd } from "@/lib/platform/fee";
import SnipeFeeSummary, { useSnipeFeeAcceptance } from "@/components/sniper/SnipeFeeSummary";
import { useCollectSnipeFee } from "@/components/sniper/useCollectSnipeFee";
import { feeButtonSuffix, runSnipeWithFee } from "@/components/sniper/runSnipeWithFee";

interface ProviderRateSnipeModalProps {
  quote: ProviderQuote;
  from: string;
  to: string;
  amount: number;
  onClose: () => void;
  onHuntStarted: (eventName: string) => void;
}

export default function ProviderRateSnipeModal({
  quote,
  from,
  to,
  amount,
  onClose,
  onHuntStarted,
}: ProviderRateSnipeModalProps) {
  const { provider, effectiveRate } = quote;
  const midRate = getMidRate(from, to);
  const [targetRate, setTargetRate] = useState(
    Math.round(effectiveRate * 10000) / 10000
  );
  const [alertAmount, setAlertAmount] = useState(amount);
  const [autoReserve, setAutoReserve] = useState(true);
  const [telegramId, setTelegramId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accepted, setAccepted } = useSnipeFeeAcceptance();
  const { collectFee, isDemoTreasury } = useCollectSnipeFee();

  const snipeValueUsd = useMemo(
    () =>
      snipeValueToUsd(alertAmount, from, (amount, currency) =>
        convertCurrency(amount, currency, "USD")
      ),
    [alertAmount, from]
  );
  const platformFeeUsd = calculateSnipeFee(snipeValueUsd);

  const handleSnipe = async () => {
    setLoading(true);
    setError(null);
    const result = await runSnipeWithFee(
      { accepted, snipeValueUsd, collectFee, isDemoTreasury },
      async () => {
        const userId = await ensureUser();
        const payload = providerRateToHuntPayload(from, to, provider, userId, {
          targetRate,
          amount: alertAmount,
          autoReserve,
          telegramChatId: telegramId || undefined,
        });
        const hunt = await createHunt(payload);
        await startHunt(hunt.id);
        onHuntStarted(hunt.event?.name ?? provider.name);
        onClose();
      }
    );
    if (!result.ok) setError(result.error ?? "Failed to start rate snipe");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="glass-dock rounded-2xl w-full max-w-lg animate-slide-up">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{provider.type === "bank" ? "🏦" : "💵"}</span>
              Snipe {provider.type === "bank" ? "Bank" : "Agent"} Rate
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {provider.name} · {provider.country}
              {provider.city ? ` · ${provider.city}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl p-3.5 text-sm text-hub-teal bg-hub-teal-light/50 border border-hub-teal/10">
            Ticket Sniper Bot monitors <strong>{provider.name}</strong> and alerts
            when their rate beats your target. Mid-market:{" "}
            {formatRate(midRate, from, to)} · Current:{" "}
            {formatRate(effectiveRate, from, to)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Target rate (1 {from} =)</label>
              <input
                type="number"
                step="0.0001"
                value={targetRate}
                onChange={(e) => setTargetRate(Number(e.target.value))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="field-label">Amount to exchange</label>
              <input
                type="number"
                value={alertAmount}
                onChange={(e) => setAlertAmount(Number(e.target.value))}
                className="input-modern"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Telegram Chat ID (optional)</label>
            <input
              type="text"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="input-modern"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={autoReserve}
              onChange={(e) => setAutoReserve(e.target.checked)}
            />
            Auto-exchange when target rate is hit
          </label>

          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-hub-blue font-medium hover:underline"
          >
            View {provider.name} rates →
          </a>

          <SnipeFeeSummary
            snipeValueUsd={snipeValueUsd}
            snipeValueLabel={`${alertAmount.toLocaleString()} ${from}`}
            accepted={accepted}
            onAcceptedChange={setAccepted}
          />

          {error && (
            <p className="text-sm text-hub-coral bg-hub-coral-light/80 px-3 py-2 rounded-xl border border-hub-coral/15">
              {error}
            </p>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-2 justify-end">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSnipe}
            disabled={loading}
            title={!accepted ? "Accept the platform fee to start this snipe" : undefined}
            className={`btn-teal${!accepted && !loading ? " opacity-60" : ""}`}
          >
            {loading
              ? "Starting..."
              : !accepted
                ? "🎯 Accept fee to start"
                : `🎯 Start Provider Snipe${feeButtonSuffix(platformFeeUsd, isDemoTreasury)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
