"use client";

import { useCallback } from "react";
import { calculateSnipeFee } from "@/lib/platform/fee";

export function useCollectSnipeFee() {
  const collectFee = useCallback(
    async (
      snipeValueUsd: number
    ): Promise<{ ok: boolean; error?: string; skipped?: boolean }> => {
      const feeUsd = calculateSnipeFee(snipeValueUsd);
      if (feeUsd <= 0) return { ok: true };
      return { ok: true, skipped: true };
    },
    []
  );

  return { collectFee, isDemoTreasury: true };
}
