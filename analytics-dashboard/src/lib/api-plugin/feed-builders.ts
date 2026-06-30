import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getCustomerIntelligence } from "@/data/customer-intelligence";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import { getWorkspace, type WorkspaceId } from "@/data/workspaces";
import { getAnalyticsOverview } from "@/lib/analytics";
import { getBehaviorCampaignAnalytics } from "@/data/behavior-campaign-analytics";
import type { TabularFeed } from "./data-feeds";

export function customerAnalyticsFeed(workspaceId: WorkspaceId): TabularFeed {
  const data = getCustomerAnalytics(workspaceId);
  const columns = ["dimension", "category", "value"];
  const rows: Record<string, string | number>[] = [
    { dimension: "summary", category: "totalCustomers", value: data.totalCustomers },
    { dimension: "summary", category: "activeCustomers", value: data.activeCustomers },
    { dimension: "summary", category: "retentionRate", value: data.retentionRate },
    { dimension: "summary", category: "churnRate", value: data.churnRate },
    { dimension: "summary", category: "avgLtv", value: data.avgLtv },
    { dimension: "summary", category: "npsScore", value: data.npsScore },
    ...data.byLifecycle.map((l) => ({
      dimension: "lifecycle",
      category: l.stage,
      value: l.count,
    })),
    ...data.bySegment.map((s) => ({
      dimension: "segment",
      category: s.segment,
      value: s.avgLtv,
    })),
    ...data.byChannel.map((c) => ({
      dimension: "channel",
      category: c.channel,
      value: c.conversionRate,
    })),
  ];

  return {
    columns,
    rows,
    rawPreview: `Subscriber feed · ${rows.length} metrics`,
  };
}

export function marketingAnalyticsFeed(workspaceId: WorkspaceId): TabularFeed {
  const data = getMarketingAnalytics(workspaceId);
  const columns = ["metric", "value"];
  const rows: Record<string, string | number>[] = [
    { metric: "Events tracked (30d)", value: data.eventsTracked30d },
    { metric: "Engagement score", value: data.avgEngagementScore },
    { metric: "Active campaigns", value: data.activeCampaigns },
    { metric: "Avg campaign ROAS", value: data.avgCampaignRoas },
    { metric: "Conversion rate", value: data.campaignConversionRate },
    ...data.behavioralSegmentBreakdown.map((s) => ({
      metric: `Segment · ${s.segment}`,
      value: s.count,
    })),
    ...data.campaigns.slice(0, 8).map((c) => ({
      metric: `Campaign · ${c.name}`,
      value: c.roas,
    })),
  ];

  return {
    columns,
    rows,
    rawPreview: `Engagement feed · ${data.campaigns.length} campaigns tracked`,
  };
}

export function customerIntelligenceFeed(workspaceId: WorkspaceId): TabularFeed {
  const data = getCustomerIntelligence(workspaceId);
  const columns = ["feed", "label", "value"];
  const rows: Record<string, string | number>[] = [
    ...data.customer360.kpis.map((k) => ({
      feed: "customer360",
      label: k.label,
      value: k.value,
    })),
    ...data.rfm.segments.map((s) => ({
      feed: "rfm",
      label: s.segment,
      value: s.count,
    })),
    ...data.cohort.retentionMatrix.map((c) => ({
      feed: "cohort",
      label: c.cohort,
      value: c.cumulativeRetention,
    })),
  ];

  return {
    columns,
    rows,
    rawPreview: `Customer 360 + RFM + cohort feed · ${rows.length} rows`,
  };
}

export async function resolveInternalFeedData(
  routePath: string,
  workspaceId: WorkspaceId
): Promise<unknown> {
  const path = routePath.split("?")[0];

  switch (path) {
    case "/api/analytics/overview":
      return getAnalyticsOverview(workspaceId);
    case "/api/customer-analytics":
      return getCustomerAnalytics(workspaceId);
    case "/api/customer-intelligence":
      return getCustomerIntelligence(workspaceId);
    case "/api/marketing-analytics":
      return getMarketingAnalytics(workspaceId);
    case "/api/u9-analytics":
      return getAnalyticsOverview(workspaceId).u9;
    case "/api/behavior-campaign-analytics":
      return getBehaviorCampaignAnalytics(workspaceId, "monthly");
    default:
      throw new Error(`Unknown internal feed route: ${path}`);
  }
}

export function workspaceFeedMeta(workspaceId: WorkspaceId) {
  const w = getWorkspace(workspaceId);
  return { code: w.workspace.code, country: w.workspace.country };
}
