import type { CSSProperties } from "react";

/** Recharts-compatible theme tokens (CSS vars are oklch — do not wrap in hsl()) */
export const CHART_COLORS = {
  border: "var(--border)",
  muted: "var(--muted-foreground)",
  card: "var(--card)",
  foreground: "var(--foreground)",
} as const;

export const CHART_TOOLTIP_STYLE: CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  fontSize: "12px",
  color: "var(--foreground)",
};

export const CHART_AXIS_TICK = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
} as const;

export const CHART_AXIS_TICK_SM = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
} as const;
