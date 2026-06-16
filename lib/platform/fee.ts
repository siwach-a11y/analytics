/** AgentHub platform fee on every bot snipe (2.5%) */
export const PLATFORM_SNIPE_FEE_PERCENT = 2.5;
export const PLATFORM_SNIPE_FEE_BPS = 250;

export function calculateSnipeFee(snipeValueUsd: number): number {
  if (!Number.isFinite(snipeValueUsd) || snipeValueUsd <= 0) return 0;
  const fee = snipeValueUsd * (PLATFORM_SNIPE_FEE_PERCENT / 100);
  return Math.round(fee * 100) / 100;
}

export function formatFeeUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function snipeValueToUsd(
  amount: number,
  currencyCode: string,
  convertToUsd: (amount: number, from: string) => number
): number {
  if (currencyCode === "USD") return amount;
  return convertToUsd(amount, currencyCode);
}
