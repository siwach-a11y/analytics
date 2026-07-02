// Search-query generator — expands a request into the family of queries the
// agent should run against trusted sources (per the product spec).
export interface QueryInput {
  countryName: string;
  category?: string;
  brand?: string;
  freeText?: string;
  categoryBrands?: string[];
}

export function generateQueries({
  countryName,
  brand,
  freeText,
  categoryBrands,
}: QueryInput): string[] {
  const c = countryName;
  const out: string[] = [];
  if (freeText?.trim()) out.push(freeText.trim());

  // Gift-card queries
  out.push(`${c} gift card`, `buy gift card ${c}`, `digital gift card ${c}`);
  const brands = brand ? [brand] : categoryBrands ?? ["Steam", "Google Play", "Apple", "Netflix"];
  for (const b of brands) out.push(`${b} gift card ${c}`);

  // Coupon / promo queries
  out.push(
    `${c} coupon`,
    `${c} promo code`,
    `${c} discount code`,
    `${c} cashback`,
    `${c} deals`,
    `${c} flash sale`
  );
  if (brand) out.push(`${brand} coupon ${c}`, `${brand} promo code`);

  return Array.from(new Set(out));
}
