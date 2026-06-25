/**
 * Server-side analytics functions — U9 Myanmar workspace (BNII demo).
 * Import from `@/lib/analytics` in pages, API routes, and server components.
 */

import { getCustomerAnalytics, customers } from "@/data/customer-analytics";
import { getBehaviorCampaignAnalytics } from "@/data/behavior-campaign-analytics";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import { getWorkspaceAnalytics, getU9Analytics } from "@/data/u9-analytics";
import { getWorkspace, getEarnChannels, WORKSPACES } from "@/data/workspaces";
import { operators, getOperatorById, getOperatorName } from "@/data";
import type {
  CustomerAnalyticsSummary,
  MarketingAnalyticsSummary,
  BehaviorCampaignAnalyticsSummary,
  CampaignAnalysisPeriod,
} from "@/types";
import type { U9Analytics } from "@/data/u9-analytics";

export type AnalyticsOverview = {
  workspace: U9Analytics["workspace"];
  customer: CustomerAnalyticsSummary;
  marketing: MarketingAnalyticsSummary;
  u9: U9Analytics;
  generatedAt: string;
};

import type { WorkspaceId } from "@/data/workspaces";

/** Combined subscriber, engagement, and workspace metrics. */
export function getAnalyticsOverview(workspaceId: WorkspaceId = "u9"): AnalyticsOverview {
  return {
    workspace: getWorkspaceAnalytics(workspaceId).workspace,
    customer: getCustomerAnalytics(workspaceId),
    marketing: getMarketingAnalytics(workspaceId),
    u9: getWorkspaceAnalytics(workspaceId),
    generatedAt: new Date().toISOString(),
  };
}

/** Subscriber lifecycle, cohorts, and earn-channel breakdown. */
export function getSubscriberAnalytics(
  workspaceId: WorkspaceId = "u9"
): CustomerAnalyticsSummary {
  return getCustomerAnalytics(workspaceId);
}

/** STW / Quest / Screen Time campaigns and behavioral segments. */
export function getEngagementAnalytics(
  workspaceId: WorkspaceId = "u9"
): MarketingAnalyticsSummary {
  return getMarketingAnalytics(workspaceId);
}

/** Customer behavioral analysis for monthly / quarterly / yearly campaigns. */
export function getBehaviorCampaignAnalyticsPayload(
  workspaceId: WorkspaceId = "u9",
  period: CampaignAnalysisPeriod = "monthly"
): BehaviorCampaignAnalyticsSummary {
  return getBehaviorCampaignAnalytics(workspaceId, period);
}

/** Atlas-style workspace dashboard payload. */
export function getWorkspaceAnalyticsPayload(id?: import("@/data/workspaces").WorkspaceId) {
  return getWorkspaceAnalytics(id ?? "u9");
}

export const analytics = {
  overview: getAnalyticsOverview,
  subscribers: getSubscriberAnalytics,
  engagement: getEngagementAnalytics,
  behaviorCampaigns: getBehaviorCampaignAnalyticsPayload,
  workspace: getWorkspaceAnalyticsPayload,
  customer: getCustomerAnalytics,
  marketing: getMarketingAnalytics,
  u9: getU9Analytics,
};

export {
  customers,
  operators,
  getOperatorById,
  getOperatorName,
  getWorkspace,
  getEarnChannels,
  WORKSPACES,
};
