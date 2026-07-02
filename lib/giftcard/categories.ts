// Categories and the popular (global) gift-card brands within each.
export interface Category {
  key: string;
  icon: string;
  brands: string[];
}

export const CATEGORIES: Category[] = [
  { key: "Gaming", icon: "🎮", brands: ["Steam", "PlayStation", "Xbox", "Nintendo", "Roblox", "PUBG", "Free Fire", "Razer Gold"] },
  { key: "Entertainment", icon: "🎬", brands: ["Netflix", "Spotify", "Disney+", "YouTube Premium"] },
  { key: "Shopping", icon: "🛒", brands: ["Amazon", "Google Play", "Apple"] },
  { key: "Travel", icon: "✈️", brands: ["Airbnb", "Uber", "Grab"] },
  { key: "Food Delivery", icon: "🍔", brands: ["Foodpanda", "Grab", "Jumia Food"] },
  { key: "Ride Hailing", icon: "🚗", brands: ["Grab", "Uber", "PickMe", "Bolt"] },
  { key: "Streaming", icon: "📺", brands: ["Netflix", "Spotify", "Disney+", "YouTube Premium"] },
  { key: "Fashion", icon: "👗", brands: ["Zalora", "ASOS", "Shein"] },
  { key: "Beauty", icon: "💄", brands: ["Sephora", "Watsons"] },
  { key: "Education", icon: "📚", brands: ["Coursera", "Udemy", "Duolingo"] },
];

export function getCategory(key: string): Category | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

/** Popular global gift-card brands surfaced as quick chips. */
export const POPULAR_BRANDS = [
  "Steam", "Google Play", "Apple", "Netflix", "Spotify", "PlayStation",
  "Xbox", "Amazon", "Free Fire", "PUBG", "Razer Gold", "Roblox",
];

/** Trending example searches for the homepage. */
export const TRENDING_SEARCHES = [
  "Steam gift card Indonesia",
  "Netflix gift card Vietnam",
  "Food delivery coupons Nigeria",
  "Google Play gift card Bangladesh",
  "PUBG UC Sri Lanka",
  "Foodpanda promo code Bangladesh",
  "Grab coupons Vietnam",
  "Jumia discount code Nigeria",
];
