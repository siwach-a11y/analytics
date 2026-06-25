import type {
  BehavioralEvent,
  CustomerBehaviorProfile,
  MarketingCampaign,
  MarketingRecommendation,
  MarketingEngagementPoint,
  MarketingAnalyticsSummary,
  BehavioralSegment,
  BehavioralEventType,
} from "@/types";

import behaviorProfilesData from "./customer-behavior-profiles.json";
import behaviorEventsData from "./customer-behavior-events.json";
import campaignsData from "./marketing-campaigns.json";
import recommendationsData from "./marketing-recommendations.json";
import engagementSeriesData from "./marketing-engagement-series.json";
import { customers } from "./customer-analytics";

export const behaviorProfiles = behaviorProfilesData as CustomerBehaviorProfile[];
export const behaviorEvents = behaviorEventsData as BehavioralEvent[];
export const marketingCampaigns = campaignsData as MarketingCampaign[];
export const marketingRecommendations =
  recommendationsData as MarketingRecommendation[];
export const marketingEngagementSeries =
  engagementSeriesData as MarketingEngagementPoint[];

export function getMarketingAnalytics(): MarketingAnalyticsSummary {
  const latest = marketingEngagementSeries[marketingEngagementSeries.length - 1];
  const previous = marketingEngagementSeries[marketingEngagementSeries.length - 2];

  const activeCampaigns = marketingCampaigns.filter((c) => c.status === "active").length;
  const completedWithSpend = marketingCampaigns.filter((c) => c.spend > 0);
  const avgCampaignRoas =
    completedWithSpend.reduce((s, c) => s + c.roas, 0) /
    Math.max(completedWithSpend.length, 1);

  const totalConversions = completedWithSpend.reduce((s, c) => s + c.conversions, 0);
  const totalClicks = completedWithSpend.reduce((s, c) => s + c.clicks, 0);
  const campaignConversionRate =
    totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  const avgEngagementScore = Math.round(
    behaviorProfiles.reduce((s, p) => s + p.engagementScore, 0) /
      behaviorProfiles.length
  );

  const eventsTracked30d = behaviorProfiles.reduce(
    (s, p) => s + p.eventsLast30Days,
    0
  );

  const engagementChange = latest.engagementScore - previous.engagementScore;
  const eventsChange =
    ((latest.events - previous.events) / previous.events) * 100;
  const roasChange = 0.4;

  const eventTypeCounts: Record<string, number> = {};
  behaviorEvents.forEach((e) => {
    eventTypeCounts[e.type] = (eventTypeCounts[e.type] ?? 0) + 1;
  });
  const eventsByType = Object.entries(eventTypeCounts).map(([type, count]) => ({
    type: type as BehavioralEventType,
    count,
  }));

  const segments: BehavioralSegment[] = [
    "power_user",
    "casual",
    "browser",
    "dormant_risk",
    "reactivation_target",
  ];
  const behavioralSegmentBreakdown = segments.map((segment) => {
    const profiles = behaviorProfiles.filter((p) => p.behavioralSegment === segment);
    return {
      segment,
      count: profiles.length,
      avgEngagement:
        profiles.reduce((s, p) => s + p.engagementScore, 0) /
        Math.max(profiles.length, 1),
    };
  });

  const journeyStages = [
    { stage: "Awareness", count: 8200000, rate: 100 },
    { stage: "Consideration", count: 5400000, rate: 65.9 },
    { stage: "First Action", count: 3920000, rate: 47.8 },
    { stage: "Repeat Engagement", count: 3100000, rate: 37.8 },
    { stage: "Campaign Convert", count: latest.campaignConversions, rate: 24.1 },
    { stage: "Loyalty", count: 2400000, rate: 29.3 },
  ];

  const campaignComparison = marketingCampaigns
    .filter((c) => c.spend > 0)
    .map((c) => ({
      name: c.name.split(" ").slice(0, 2).join(" "),
      conversions: c.conversions,
      roas: c.roas,
      spend: c.spend,
    }));

  const channelEffectiveness = [
    { channel: "Push", openRate: 28.4, conversionRate: 12.6 },
    { channel: "In-app", openRate: 64.2, conversionRate: 15.8 },
    { channel: "Email", openRate: 22.1, conversionRate: 8.4 },
    { channel: "SMS", openRate: 91.3, conversionRate: 11.2 },
  ];

  const recentEvents = [...behaviorEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 12);

  return {
    eventsTracked30d,
    avgEngagementScore,
    activeCampaigns,
    avgCampaignRoas,
    campaignConversionRate,
    engagementChange,
    eventsChange,
    roasChange,
    behaviorProfiles,
    recentEvents,
    campaigns: marketingCampaigns,
    recommendations: marketingRecommendations,
    engagementTimeSeries: marketingEngagementSeries,
    eventsByType,
    behavioralSegmentBreakdown,
    journeyStages,
    campaignComparison,
    channelEffectiveness,
  };
}

export function getCustomerWithBehavior(customerId: string) {
  const customer = customers.find((c) => c.id === customerId);
  const behavior = behaviorProfiles.find((p) => p.customerId === customerId);
  const events = behaviorEvents.filter((e) => e.customerId === customerId);
  return { customer, behavior, events };
}
