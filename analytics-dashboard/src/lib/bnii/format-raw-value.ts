export function formatRawValue(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  const abs = Math.abs(value);

  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  if (abs >= 100) {
    return value.toFixed(0);
  }
  if (abs >= 10) {
    return value.toFixed(1).replace(/\.0$/, "");
  }
  return value.toFixed(1);
}
