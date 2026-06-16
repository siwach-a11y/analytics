"use client";

import { useState } from "react";
import {
  calculateSnipeFee,
  formatFeeUsd,
  PLATFORM_SNIPE_FEE_PERCENT,
} from "@/lib/platform/fee";

interface SnipeFeeSummaryProps {
  snipeValueUsd: number;
  snipeValueLabel?: string;
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}

export default function SnipeFeeSummary({
  snipeValueUsd,
  snipeValueLabel,
  accepted,
  onAcceptedChange,
}: SnipeFeeSummaryProps) {
  const fee = calculateSnipeFee(snipeValueUsd);

  return (
    <div className="rounded-xl p-3.5 text-sm bg-white/90 border border-white shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-slate-500">Estimated snipe value</span>
        <span className="font-medium text-slate-800">
          {snipeValueLabel ?? formatFeeUsd(snipeValueUsd)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-lime-100 pt-2">
        <span className="text-hub-teal font-medium">
          AgentHub platform fee ({PLATFORM_SNIPE_FEE_PERCENT}%)
        </span>
        <span className="font-bold text-hub-teal">{formatFeeUsd(fee)}</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        A {PLATFORM_SNIPE_FEE_PERCENT}% platform fee is charged on every bot snipe.
      </p>
      <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer rounded-lg border border-lime-200/80 bg-lime-50/50 px-3 py-2.5">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-hub-teal"
        />
        <span>
          I agree to the {PLATFORM_SNIPE_FEE_PERCENT}% AgentHub platform fee (
          {formatFeeUsd(fee)}) for this snipe.
          {!accepted && (
            <span className="block mt-1 text-hub-coral font-medium">
              Check this box to enable Start Snipe.
            </span>
          )}
        </span>
      </label>
    </div>
  );
}

export function useSnipeFeeAcceptance() {
  const [accepted, setAccepted] = useState(false);
  return { accepted, setAccepted };
}
