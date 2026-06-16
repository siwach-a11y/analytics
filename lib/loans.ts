import { LoanProvider, LoanQuote } from "@/lib/types";

/** Monthly payment (amortizing fixed-rate loan) */
export function monthlyPayment(
  principal: number,
  annualApr: number,
  termMonths: number
): number {
  if (termMonths <= 0 || principal <= 0) return 0;
  const r = annualApr / 100 / 12;
  if (r === 0) return principal / termMonths;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}

/** Effective APR adjusted for credit score, amount, term */
export function effectiveApr(
  provider: LoanProvider,
  amount: number,
  termMonths: number,
  creditScore: number
): number {
  let apr = provider.baseApr;

  if (creditScore >= 750) apr -= 1.2;
  else if (creditScore >= 700) apr -= 0.6;
  else if (creditScore < 650) apr += 1.5;
  else if (creditScore < 600) apr += 3;

  if (amount >= 25000) apr -= 0.3;
  if (termMonths <= 36) apr -= 0.2;
  if (termMonths >= 72) apr += 0.4;

  if (provider.type === "credit_union") apr -= 0.25;
  if (provider.type === "fintech" && creditScore < 650) apr -= 0.5;

  return Math.max(apr, 4.99);
}

export function quoteLoan(
  provider: LoanProvider,
  amount: number,
  termMonths: number,
  creditScore: number
): LoanQuote | null {
  if (
    amount < provider.minAmount ||
    amount > provider.maxAmount ||
    termMonths < provider.minTermMonths ||
    termMonths > provider.maxTermMonths ||
    creditScore < provider.minCreditScore
  ) {
    return null;
  }

  const apr = effectiveApr(provider, amount, termMonths, creditScore);
  const originationFee = amount * (provider.originationFeePercent / 100);
  const principal = amount + originationFee;
  const payment = monthlyPayment(principal, apr, termMonths);
  const totalCost = payment * termMonths;
  const totalInterest = totalCost - amount;

  return {
    provider,
    apr: Math.round(apr * 100) / 100,
    monthlyPayment: Math.round(payment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    originationFee: Math.round(originationFee * 100) / 100,
    rank: 0,
  };
}

export function rankLoanQuotes(quotes: LoanQuote[]): LoanQuote[] {
  return [...quotes]
    .sort((a, b) => a.apr - b.apr || a.totalCost - b.totalCost)
    .map((q, i) => ({ ...q, rank: i + 1 }));
}

export function formatApr(apr: number): string {
  return `${apr.toFixed(2)}% APR`;
}

export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
