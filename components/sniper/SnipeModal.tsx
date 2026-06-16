"use client";

import { useMemo, useState } from "react";
import { createHunt, ensureUser, startHunt } from "@/lib/ticket-sniper/client";
import { CreateHuntPayload } from "@/lib/ticket-sniper/types";
import { SnipeOptions } from "@/lib/ticket-sniper/payloads";
import { calculateSnipeFee } from "@/lib/platform/fee";
import SnipeFeeSummary, { useSnipeFeeAcceptance } from "@/components/sniper/SnipeFeeSummary";
import { useCollectSnipeFee } from "@/components/sniper/useCollectSnipeFee";
import { feeButtonSuffix, runSnipeWithFee } from "@/components/sniper/runSnipeWithFee";

export interface SnipeModalConfig {
  title: string;
  subtitle: string;
  price: number;
  bookingUrl: string;
  platform?: string;
  disabled?: boolean;
  quantityLabel?: string;
  quantityDefault?: number;
  priorityZonesDefault?: string;
  showMaxRow?: boolean;
  showAdjacent?: boolean;
  infoText?: string;
  eventName: string;
  buildPayload: (userId: string, options: SnipeOptions) => CreateHuntPayload;
}

interface SnipeModalProps extends SnipeModalConfig {
  onClose: () => void;
  onHuntStarted: (eventName: string) => void;
}

export default function SnipeModal({
  title,
  subtitle,
  price,
  bookingUrl,
  platform = "generic",
  disabled = false,
  quantityLabel = "Quantity",
  quantityDefault = 2,
  priorityZonesDefault = "",
  showMaxRow = false,
  showAdjacent = false,
  infoText = "Automated price monitoring, availability scanning, and auto-book with CAPTCHA/OTP handoff.",
  eventName,
  buildPayload,
  onClose,
  onHuntStarted,
}: SnipeModalProps) {
  const [quantity, setQuantity] = useState(quantityDefault);
  const [priorityZones, setPriorityZones] = useState(priorityZonesDefault);
  const [priceMin, setPriceMin] = useState(Math.round(price * 0.8));
  const [priceMax, setPriceMax] = useState(Math.round(price * 1.2));
  const [maxRow, setMaxRow] = useState(20);
  const [adjacent, setAdjacent] = useState(false);
  const [autoReserve, setAutoReserve] = useState(true);
  const [telegramId, setTelegramId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accepted, setAccepted } = useSnipeFeeAcceptance();
  const { collectFee, isDemoTreasury } = useCollectSnipeFee();

  const snipeValueUsd = useMemo(
    () => Math.max(price, priceMax) * quantity,
    [price, priceMax, quantity]
  );
  const platformFeeUsd = calculateSnipeFee(snipeValueUsd);

  const handleSnipe = async () => {
    setLoading(true);
    setError(null);
    const result = await runSnipeWithFee(
      {
        accepted,
        snipeValueUsd,
        collectFee,
        isDemoTreasury,
      },
      async () => {
        const userId = await ensureUser();
        const payload = buildPayload(userId, {
          quantity,
          priorityZones: priorityZones
            .split(",")
            .map((z) => z.trim())
            .filter(Boolean),
          fallbackPriceMin: priceMin,
          fallbackPriceMax: priceMax,
          maxRow: showMaxRow ? maxRow : undefined,
          adjacentSeatsRequired: showAdjacent ? adjacent : undefined,
          autoReserve,
          telegramChatId: telegramId || undefined,
        });
        const hunt = await createHunt(payload);
        await startHunt(hunt.id);
        onHuntStarted(hunt.event?.name ?? eventName);
        onClose();
      }
    );
    if (!result.ok) setError(result.error ?? "Failed to start snipe");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="glass-dock rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>🎯</span> {title}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl p-3.5 text-sm text-hub-blue bg-hub-blue-light/50 border border-hub-blue/10">
            Powered by <strong>Ticket Sniper Bot</strong> — {infoText}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">{quantityLabel}</label>
              <input
                type="number"
                min={1}
                max={14}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input-modern"
              />
            </div>
            {showMaxRow && (
              <div>
                <label className="field-label">Max Row</label>
                <input
                  type="number"
                  min={1}
                  value={maxRow}
                  onChange={(e) => setMaxRow(Number(e.target.value))}
                  className="input-modern"
                />
              </div>
            )}
            <div>
              <label className="field-label">Min Price ($)</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="field-label">Max Price ($)</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="input-modern"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Priority filters (comma-separated)</label>
            <input
              type="text"
              value={priorityZones}
              onChange={(e) => setPriorityZones(e.target.value)}
              className="input-modern"
              placeholder="e.g. Economy, Nonstop, Pool"
            />
          </div>

          <div>
            <label className="field-label">Telegram Chat ID (optional)</label>
            <input
              type="text"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              placeholder="For hunt notifications"
              className="input-modern"
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {showAdjacent && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={adjacent}
                  onChange={(e) => setAdjacent(e.target.checked)}
                />
                Adjacent seats
              </label>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoReserve}
                onChange={(e) => setAutoReserve(e.target.checked)}
              />
              Auto-book when found
            </label>
          </div>

          <SnipeFeeSummary
            snipeValueUsd={snipeValueUsd}
            accepted={accepted}
            onAcceptedChange={setAccepted}
          />

          <div className="text-xs text-slate-400">
            Platform: {platform} ·{" "}
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-hub-blue font-medium hover:underline"
            >
              View booking page
            </a>
          </div>

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
            disabled={loading || disabled}
            title={!accepted ? "Accept the platform fee to start this snipe" : undefined}
            className={`btn-coral${!accepted && !loading ? " opacity-60" : ""}`}
          >
            {loading
              ? "Starting..."
              : !accepted
                ? "🎯 Accept fee to start"
                : `🎯 Start Snipe${feeButtonSuffix(platformFeeUsd, isDemoTreasury)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
