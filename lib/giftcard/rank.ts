import { CouponResult, GiftCardResult, SearchResults } from "./types";

export type GiftCardSort = "best" | "trust" | "price";
export type CouponSort = "best" | "trust" | "discount";

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function priceValue(s?: string): number {
  if (!s) return Number.POSITIVE_INFINITY;
  const m = s.replace(/[, ]/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : Number.POSITIVE_INFINITY;
}

function discountValue(s?: string): number {
  if (!s) return 0;
  const m = s.match(/(\d+)\s*%/);
  return m ? parseInt(m[1], 10) : 0;
}

function dedupe<T extends { brand?: string; merchant?: string; url: string; code?: string }>(
  items: T[]
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const key = `${(it.brand ?? it.merchant ?? "").toLowerCase()}|${host(it.url)}|${(it.code ?? "").toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export function rankGiftCards(items: GiftCardResult[], sort: GiftCardSort = "best"): GiftCardResult[] {
  const list = dedupe(items);
  return list.sort((a, b) => {
    if (sort === "trust") return b.trustScore - a.trustScore;
    if (sort === "price") return priceValue(a.sellingPrice) - priceValue(b.sellingPrice);
    // best match: official first, then trust score
    const off = Number(b.sourceType === "official") - Number(a.sourceType === "official");
    if (off !== 0) return off;
    return b.trustScore - a.trustScore;
  });
}

export function rankCoupons(items: CouponResult[], sort: CouponSort = "best"): CouponResult[] {
  const list = dedupe(items);
  return list.sort((a, b) => {
    if (sort === "trust") return b.trustScore - a.trustScore;
    if (sort === "discount") return discountValue(b.discount) - discountValue(a.discount);
    // best match: verified first, then trust score
    const ver = Number(b.verified) - Number(a.verified);
    if (ver !== 0) return ver;
    return b.trustScore - a.trustScore;
  });
}

export function rankResults(r: SearchResults): SearchResults {
  return { giftCards: rankGiftCards(r.giftCards), coupons: rankCoupons(r.coupons) };
}
