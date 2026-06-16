import { exchangeRates } from "@/lib/data/currencies";
import { ExchangeProvider, ProviderQuote } from "@/lib/types";

export function convertCurrency(
  amount: number,
  from: string,
  to: string
): number {
  if (from === to) return amount;
  const fromRate = exchangeRates[from];
  const toRate = exchangeRates[to];
  if (!fromRate || !toRate) return 0;
  const inUsd = amount / fromRate;
  return inUsd * toRate;
}

export function getMidRate(from: string, to: string): number {
  if (from === to) return 1;
  return convertCurrency(1, from, to);
}

export function quoteProvider(
  amount: number,
  from: string,
  to: string,
  provider: ExchangeProvider
): ProviderQuote {
  const midRate = getMidRate(from, to);
  const gross = convertCurrency(amount, from, to) * (1 - provider.spreadPercent / 100);
  const feeInTarget =
    provider.flatFee > 0
      ? convertCurrency(provider.flatFee, from, to)
      : 0;
  const outputAmount = Math.max(0, gross - feeInTarget);
  const effectiveRate = amount > 0 ? outputAmount / amount : 0;

  return {
    provider,
    midRate,
    effectiveRate,
    outputAmount,
    spreadPercent: provider.spreadPercent,
    rank: 0,
  };
}

export function rankProviderQuotes(quotes: ProviderQuote[]): ProviderQuote[] {
  return [...quotes]
    .sort((a, b) => b.outputAmount - a.outputAmount)
    .map((q, i) => ({ ...q, rank: i + 1 }));
}

export function formatCurrency(amount: number, code: string): string {
  const decimals = ["JPY", "KRW"].includes(code) ? 0 : 2;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted} ${code}`;
}

export function formatRate(rate: number, from: string, to: string): string {
  const decimals = ["JPY", "KRW"].includes(to) ? 2 : 4;
  return `1 ${from} = ${rate.toFixed(decimals)} ${to}`;
}
