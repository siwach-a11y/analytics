"use client";

import { useMemo, useState } from "react";
import { LoanQuote } from "@/lib/types";
import { formatApr } from "@/lib/loans";
import { createHunt, ensureUser, startHunt } from "@/lib/ticket-sniper/client";
import { loanQuoteToHuntPayload } from "@/lib/ticket-sniper/payloads";
import { calculateSnipeFee } from "@/lib/platform/fee";
import SnipeFeeSummary, { useSnipeFeeAcceptance } from "@/components/sniper/SnipeFeeSummary";
import { useCollectSnipeFee } from "@/components/sniper/useCollectSnipeFee";
import { feeButtonSuffix, runSnipeWithFee } from "@/components/sniper/runSnipeWithFee";

interface LoanRateSnipeModalProps {
  quote: LoanQuote;
  amount: number;
  termMonths: number;
  creditScore: number;
  onClose: () => void;
  onHuntStarted: (eventName: string) => void;
}

export default function LoanRateSnipeModal({
  quote,
  amount,
  termMonths,
  creditScore,
  onClose,
  onHuntStarted,
}: LoanRateSnipeModalProps) {
  const [targetApr, setTargetApr] = useState(
    Math.max(quote.apr - 0.5, 4.99)
  );
  const [autoReserve, setAutoReserve] = useState(true);
  const [telegramId, setTelegramId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accepted, setAccepted } = useSnipeFeeAcceptance();
  const { collectFee, isDemoTreasury } = useCollectSnipeFee();

  const snipeValueUsd = useMemo(() => amount, [amount]);
  const platformFeeUsd = calculateSnipeFee(snipeValueUsd);

  const handleSnipe = async () => {
    setLoading(true);
    setError(null);
    const result = await runSnipeWithFee(
      { accepted, snipeValueUsd, collectFee, isDemoTreasury },
      async () => {
        const userId = await ensureUser();
        const payload = loanQuoteToHuntPayload(
          quote.provider,
          amount,
          termMonths,
          creditScore,
          userId,
          { targetApr, autoReserve, telegramChatId: telegramId || undefined }
        );
        const hunt = await createHunt(payload);
        await startHunt(hunt.id);
        onHuntStarted(
          hunt.event?.name ?? `${quote.provider.name} @ ${targetApr}%`
        );
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
              <span>🎯</span> Loan Rate Sniper
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {quote.provider.name} · current {formatApr(quote.apr)}
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
          <div className="rounded-xl p-3.5 text-sm text-hub-teal bg-white/90 border border-white shadow-sm">
            Monitors {quote.provider.name} for APR drops on ${amount.toLocaleString()}{" "}
            / {termMonths}mo loans and alerts when your target rate is available.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Target APR (%)</label>
              <input
                type="number"
                step={0.01}
                min={4.99}
                max={quote.apr}
                value={targetApr}
                onChange={(e) => setTargetApr(Number(e.target.value))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="field-label">Current quote</label>
              <input
                type="text"
                readOnly
                value={formatApr(quote.apr)}
                className="input-modern bg-lime-50/50"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Telegram Chat ID (optional)</label>
            <input
              type="text"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              placeholder="For rate drop notifications"
              className="input-modern"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={autoReserve}
              onChange={(e) => setAutoReserve(e.target.checked)}
            />
            Auto-apply when target APR is available
          </label>

          <p className="text-xs text-slate-400">
            <a
              href={quote.provider.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-hub-teal font-medium hover:underline"
            >
              View lender page
            </a>
          </p>

          <SnipeFeeSummary
            snipeValueUsd={snipeValueUsd}
            snipeValueLabel={`$${amount.toLocaleString()} loan`}
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
            className={`btn-coral${!accepted && !loading ? " opacity-60" : ""}`}
          >
            {loading
              ? "Starting..."
              : !accepted
                ? "🎯 Accept fee to start"
                : `🎯 Start Rate Snipe${feeButtonSuffix(platformFeeUsd, isDemoTreasury)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
