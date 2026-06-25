/**
 * Client-side analytics API — fetch JSON from Next.js routes.
 * Use in client components; for server code prefer `@/lib/analytics`.
 */

import type { AnalyticsOverview } from "@/lib/analytics";
import type { CustomerAnalyticsSummary, MarketingAnalyticsSummary } from "@/types";
import type { U9Analytics } from "@/data/u9-analytics";

const BASE = "";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Analytics API error: ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export const analyticsApi = {
  overview: () => fetchJson<AnalyticsOverview>("/api/analytics/overview"),
  subscribers: () => fetchJson<CustomerAnalyticsSummary>("/api/customer-analytics"),
  engagement: () => fetchJson<MarketingAnalyticsSummary>("/api/marketing-analytics"),
  workspace: () => fetchJson<U9Analytics>("/api/u9-analytics"),
};

/** Alias for telecom-dapp-dashboard-style `api` imports. */
export const api = {
  customerAnalytics: analyticsApi.subscribers,
  marketingAnalytics: analyticsApi.engagement,
  analyticsOverview: analyticsApi.overview,
  u9Analytics: analyticsApi.workspace,
};
