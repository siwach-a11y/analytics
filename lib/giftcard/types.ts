// Data models for the Gift Card & Coupon AI Search agent.
// Designed so real APIs can replace the AI/mock source later without UI changes.

export type SourceType = "official" | "marketplace";

export interface GiftCardResult {
  id: string;
  brand: string;
  category: string;
  country: string; // ISO alpha-2
  currency: string;
  faceValue?: string;
  sellingPrice?: string;
  availability?: string;
  sourceType: SourceType;
  url: string;
  source?: string; // host / site name
  lastUpdated?: string;
  trustScore: number; // 0-100
}

export type CouponType =
  | "Discount Code"
  | "Promo Code"
  | "Cashback"
  | "Flash Sale"
  | "Free Shipping"
  | "Buy One Get One"
  | "Seasonal Promotion";

export interface CouponResult {
  id: string;
  merchant: string;
  country: string; // ISO alpha-2
  category?: string;
  couponType: string;
  code?: string;
  discount?: string;
  expiration?: string;
  terms?: string;
  verified: boolean;
  url: string;
  source?: string;
  trustScore: number; // 0-100
}

export interface SearchResults {
  giftCards: GiftCardResult[];
  coupons: CouponResult[];
}

export interface SearchParams {
  query: string; // free-text (may be empty)
  country: string; // ISO alpha-2
  category?: string; // optional category key
  brand?: string; // optional brand
  mode: "all" | "giftcards" | "coupons";
}
