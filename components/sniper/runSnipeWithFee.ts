import { calculateSnipeFee, formatFeeUsd } from "@/lib/platform/fee";

export interface SnipeFeeGate {
  accepted: boolean;
  snipeValueUsd: number;
  collectFee: (usd: number) => Promise<{ ok: boolean; error?: string; skipped?: boolean }>;
  isDemoTreasury: boolean;
}

export async function runSnipeWithFee(
  gate: SnipeFeeGate,
  startHunt: () => Promise<void>
): Promise<{ ok: boolean; error?: string }> {
  if (!gate.accepted) {
    return { ok: false, error: "Accept the platform fee to start this snipe." };
  }

  const feeUsd = calculateSnipeFee(gate.snipeValueUsd);

  if (feeUsd > 0 && !gate.isDemoTreasury) {
    const payment = await gate.collectFee(gate.snipeValueUsd);
    if (!payment.ok) {
      return { ok: false, error: payment.error ?? "Platform fee payment failed." };
    }
  }

  try {
    await startHunt();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to start snipe",
    };
  }
}

export function feeButtonSuffix(feeUsd: number, isDemo: boolean): string {
  if (isDemo || feeUsd <= 0) return "";
  return ` · ${formatFeeUsd(feeUsd)} fee`;
}
