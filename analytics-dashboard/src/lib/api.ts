/**
 * Client API — analytics routes + API plugin fetch.
 */

import type { AnalyticsOverview } from "@/lib/analytics";
import type { ApiPluginFetchRequest, ParsedApiPluginResult } from "@/lib/api-plugin";
import { runApiPlugin } from "@/lib/api-plugin";
import { getBehaviorCampaignAnalytics } from "@/data/behavior-campaign-analytics";
import { API_PLUGIN_DEFINITIONS } from "@/lib/api-plugin/registry";
import type {
  BehaviorCampaignAnalyticsSummary,
  CampaignAnalysisPeriod,
  CustomerAnalyticsSummary,
  MarketingAnalyticsSummary,
} from "@/types";
import type { WorkspaceId } from "@/data/workspaces";
import { getCustomerIntelligence } from "@/data/customer-intelligence";
import type { CustomerIntelligenceSummary } from "@/types/customer-intelligence";
import type { U9Analytics } from "@/data/u9-analytics";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function apiPath(path: string): string {
  return `${BASE}${path}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(apiPath(path));
  if (!res.ok) throw new Error(`Analytics API error: ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export const analyticsApi = {
  overview: () => fetchJson<AnalyticsOverview>("/api/analytics/overview"),
  subscribers: () => fetchJson<CustomerAnalyticsSummary>("/api/customer-analytics"),
  engagement: () => fetchJson<MarketingAnalyticsSummary>("/api/marketing-analytics"),
  workspace: () => fetchJson<U9Analytics>("/api/u9-analytics"),
  behaviorCampaigns: async (
    workspaceId: WorkspaceId = "u9",
    period: CampaignAnalysisPeriod = "monthly"
  ) => {
    if (process.env.NEXT_PUBLIC_STATIC_DEMO === "true") {
      return getBehaviorCampaignAnalytics(workspaceId, period);
    }
    return fetchJson<BehaviorCampaignAnalyticsSummary>(
      `/api/behavior-campaign-analytics?workspace=${workspaceId}&period=${period}`
    );
  },
  customerIntelligence: async (workspaceId: WorkspaceId = "u9") => {
    if (process.env.NEXT_PUBLIC_STATIC_DEMO === "true") {
      return getCustomerIntelligence(workspaceId);
    }
    return fetchJson<CustomerIntelligenceSummary>(
      `/api/customer-intelligence?workspace=${workspaceId}`
    );
  },
};

export const apiPluginApi = {
  catalog: () =>
    fetchJson<{ plugins: typeof API_PLUGIN_DEFINITIONS; version: string }>(
      "/api/plugin/catalog"
    ),

  /** Run plugin — client engine on static export; API route in dev. */
  async fetch(request: ApiPluginFetchRequest): Promise<ParsedApiPluginResult> {
    if (process.env.NEXT_PUBLIC_STATIC_DEMO === "true") {
      return runApiPlugin(request);
    }

    const res = await fetch(apiPath("/api/plugin/fetch"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? `Plugin API error: ${res.status}`);
    }

    return res.json() as Promise<ParsedApiPluginResult>;
  },
};

/** Alias for telecom-dapp-dashboard-style `api` imports. */
export const api = {
  customerAnalytics: analyticsApi.subscribers,
  marketingAnalytics: analyticsApi.engagement,
  behaviorCampaignAnalytics: analyticsApi.behaviorCampaigns,
  customerIntelligence: analyticsApi.customerIntelligence,
  analyticsOverview: analyticsApi.overview,
  u9Analytics: analyticsApi.workspace,
  pluginCatalog: apiPluginApi.catalog,
  pluginFetch: apiPluginApi.fetch,
};
