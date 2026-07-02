// Supported emerging-market countries + their local brands.
export interface Country {
  code: string; // ISO alpha-2
  name: string;
  flag: string;
  currency: string; // ISO 4217
  brands: string[]; // notable local merchants / telcos / wallets
}

export const COUNTRIES: Country[] = [
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", currency: "LKR", brands: ["Dialog", "Mobitel", "PickMe", "Keells", "Cargills"] },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", currency: "IDR", brands: ["Tokopedia", "Shopee", "Lazada", "Grab", "GoPay", "DANA", "OVO"] },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", currency: "BDT", brands: ["Daraz", "Foodpanda", "Robi", "Grameenphone"] },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", currency: "VND", brands: ["Shopee", "Grab", "MoMo", "ZaloPay"] },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", currency: "MMK", brands: ["WavePay", "Mytel", "Ooredoo"] },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", currency: "ETB", brands: ["Ethio Telecom", "Telebirr"] },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "NGN", brands: ["Jumia", "Konga", "Opay", "MTN", "Airtel"] },
];

export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export const DEFAULT_COUNTRY = "ID";
