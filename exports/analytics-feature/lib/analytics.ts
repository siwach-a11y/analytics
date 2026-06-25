/**
 * Server-side analytics functions — U9 Myanmar workspace (BNII demo).
 * Import from `@/lib/analytics` in pages, API routes, and server components.
 */

import { getCustomerAnalytics, customers } from "@/data/customer-analytics";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import { getU9Analytics, U9, U9_EARN_CHANNELS } from "@/data/u9-analytics";
import { operators, getOperatorById, getOperatorName } from "@/data";
import type {
  CustomerAnalyticsSummary,
  MarketingAnalyticsSummary,
} from "@/types";
import type { U9Analytics } from "@/data/u9-analytics";

export type AnalyticsOverview = {
  workspace: U9Analytics["workspace"];
  customer: CustomerAnalyticsSummary;
  marketing: MarketingAnalyticsSummary;
  u9: U9Analytics;
  generatedAt: string;
};

/** Combined subscriber, engagement, and workspace metrics. */
export function getAnalyticsOverview(): AnalyticsOverview {
  return {
    workspace: getU9Analytics().workspace,
    customer: getCustomerAnalytics(),
    marketing: getMarketingAnalytics(),
    u9: getU9Analytics(),
    generatedAt: new Date().toISOString(),
  };
}

/** Subscriber lifecycle, cohorts, and earn-channel breakdown. */
export function getSubscriberAnalytics(): CustomerAnalyticsSummary {
  return getCustomerAnalytics();
}

/** STW / Quest / Screen Time campaigns and behavioral segments. */
export function getEngagementAnalytics(): MarketingAnalyticsSummary {
  return getMarketingAnalytics();
}

/** Atlas-style U9 workspace dashboard payload. */
export function getWorkspaceAnalytics(): U9Analytics {
  return getU9Analytics();
}

export const analytics = {
  overview: getAnalyticsOverview,
  subscribers: getSubscriberAnalytics,
  engagement: getEngagementAnalytics,
  workspace: getWorkspaceAnalytics,
  customer: getCustomerAnalytics,
  marketing: getMarketingAnalytics,
  u9: getU9Analytics,
};

export {
  customers,
  operators,
  getOperatorById,
  getOperatorName,
  U9,
  U9_EARN_CHANNELS,
};
