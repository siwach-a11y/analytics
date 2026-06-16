export interface CryptoRates {
  ethUsd: number;
  usdcUsd: number;
  updatedAt: number;
}

let cache: CryptoRates | null = null;
let cacheTime = 0;
const CACHE_MS = 60_000;

export async function fetchCryptoRates(): Promise<CryptoRates> {
  if (cache && Date.now() - cacheTime < CACHE_MS) return cache;

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = await res.json();
    cache = {
      ethUsd: data.ethereum?.usd ?? 3500,
      usdcUsd: data["usd-coin"]?.usd ?? 1,
      updatedAt: Date.now(),
    };
    cacheTime = Date.now();
    return cache;
  } catch {
    return (
      cache ?? {
        ethUsd: 3500,
        usdcUsd: 1,
        updatedAt: Date.now(),
      }
    );
  }
}

export function cryptoToFiat(
  amount: number,
  symbol: "ETH" | "USDC",
  rates: CryptoRates
): number {
  if (symbol === "ETH") return amount * rates.ethUsd;
  return amount * rates.usdcUsd;
}

export function fiatToCrypto(
  fiatAmount: number,
  symbol: "ETH" | "USDC",
  rates: CryptoRates
): number {
  if (symbol === "ETH") return fiatAmount / rates.ethUsd;
  return fiatAmount / rates.usdcUsd;
}

export function formatEth(value: number): string {
  return `${value.toFixed(6)} ETH`;
}

export function formatUsdc(value: number): string {
  return `${value.toFixed(2)} USDC`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
