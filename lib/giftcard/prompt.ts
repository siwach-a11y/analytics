// Prompt construction + response parsing for the Gift Card & Coupon search
// agent. Pure (no Node deps) so both the server route and the browser-direct
// client can share it.
import { SearchParams, SearchResults } from "./types";
import { getCountry } from "./countries";
import { getCategory } from "./categories";
import { generateQueries } from "./queryGenerator";

export function buildSearchPrompt(params: SearchParams): string {
  const country = getCountry(params.country);
  const countryName = country?.name ?? params.country;
  const currency = country?.currency ?? "";
  const localBrands = country?.brands ?? [];
  const cat = params.category ? getCategory(params.category) : undefined;
  const categoryBrands = cat?.brands;

  const queries = generateQueries({
    countryName,
    category: params.category,
    brand: params.brand,
    freeText: params.query,
    categoryBrands,
  });

  const want =
    params.mode === "giftcards"
      ? "gift cards only"
      : params.mode === "coupons"
        ? "coupons/promotions only"
        : "both gift cards and coupons";

  return `You are the Gift Card & Coupon Search Agent for an AI voucher marketplace serving emerging markets.

Task: Use web search to find CURRENT, real digital ${want} available in ${countryName}${currency ? ` (currency ${currency})` : ""}.
${params.category ? `Focus category: ${params.category}.` : ""}${params.brand ? ` Focus brand: ${params.brand}.` : ""}

Run searches like: ${queries.slice(0, 12).map((q) => `"${q}"`).join(", ")}.
Prioritise official brand stores first, then reputable marketplaces. Consider local brands relevant to ${countryName}: ${localBrands.join(", ")}.

Assign each result a trustScore 0-100: official brand site 85-100, well-known regional marketplace 60-84, lesser-known reseller 30-59, unverified 0-29.

Return ONLY a JSON object (no prose) of this exact shape:
{
  "giftCards": [
    {
      "brand": "Steam",
      "category": "Gaming",
      "currency": "${currency}",
      "faceValue": "e.g. 100000 IDR",
      "sellingPrice": "actual price if shown",
      "availability": "in stock / limited / preorder",
      "sourceType": "official" | "marketplace",
      "url": "purchase URL",
      "source": "site name/host",
      "trustScore": 0
    }
  ],
  "coupons": [
    {
      "merchant": "Foodpanda",
      "couponType": "Discount Code" | "Promo Code" | "Cashback" | "Flash Sale" | "Free Shipping" | "Buy One Get One" | "Seasonal Promotion",
      "code": "code if any",
      "discount": "e.g. 20% off",
      "expiration": "date if shown",
      "terms": "short T&C",
      "verified": true,
      "url": "promotion URL",
      "source": "site name/host",
      "trustScore": 0
    }
  ]
}
Return up to 8 gift cards and 6 coupons. Omit a field if unknown. Output the JSON object and nothing else.`;
}

/** Extract the JSON object from the model's text and coerce to SearchResults. */
export function parseSearchResults(text: string, country: string): SearchResults {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return { giftCards: [], coupons: [] };

  let raw: { giftCards?: unknown[]; coupons?: unknown[] };
  try {
    raw = JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return { giftCards: [], coupons: [] };
  }

  const gc = Array.isArray(raw.giftCards) ? raw.giftCards : [];
  const cp = Array.isArray(raw.coupons) ? raw.coupons : [];

  const giftCards = gc
    .map((r, i) => coerceGiftCard(r as Record<string, unknown>, country, i))
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const coupons = cp
    .map((r, i) => coerceCoupon(r as Record<string, unknown>, country, i))
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return { giftCards, coupons };
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

function coerceGiftCard(r: Record<string, unknown>, country: string, i: number) {
  const brand = str(r.brand);
  const url = str(r.url);
  if (!brand || !url) return null;
  return {
    id: `gc-${country}-${i}-${url}`,
    brand,
    category: str(r.category) ?? "Shopping",
    country,
    currency: str(r.currency) ?? "",
    faceValue: str(r.faceValue),
    sellingPrice: str(r.sellingPrice),
    availability: str(r.availability),
    sourceType: str(r.sourceType) === "official" ? ("official" as const) : ("marketplace" as const),
    url,
    source: str(r.source),
    lastUpdated: str(r.lastUpdated),
    trustScore: num(r.trustScore),
  };
}

function coerceCoupon(r: Record<string, unknown>, country: string, i: number) {
  const merchant = str(r.merchant);
  const url = str(r.url);
  if (!merchant || !url) return null;
  return {
    id: `cp-${country}-${i}-${url}`,
    merchant,
    country,
    category: str(r.category),
    couponType: str(r.couponType) ?? "Promo Code",
    code: str(r.code),
    discount: str(r.discount),
    expiration: str(r.expiration),
    terms: str(r.terms),
    verified: r.verified === true || String(r.verified).toLowerCase() === "true",
    url,
    source: str(r.source),
    trustScore: num(r.trustScore),
  };
}
