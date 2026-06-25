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
import { U9 } from "./u9-constants";
import { getCustomerAnalytics } from "./customer-analytics";
import { getWorkspace, type WorkspaceId, type WorkspaceMetrics } from "./workspaces";

function buildBehaviorProfiles(
  W: WorkspaceMetrics,
  customers: ReturnType<typeof getCustomerAnalytics>["customers"]
): CustomerBehaviorProfile[] {
  return customers.map((c, i) => ({
    customerId: c.id,
    engagementScore: Math.min(100, Math.round(40 + c.retentionScore * 0.55)),
    sessionFrequency:
      i % 4 === 0 ? "daily" : i % 3 === 0 ? "weekly" : i % 2 === 0 ? "monthly" : "rare",
    avgSessionMinutes: W.engagement.avgSessionSeconds / 60 + (i % 3) * 0.5,
    preferredChannel: (["push", "in_app", "sms", "email"] as const)[i % 4],
    behavioralSegment: (
      [
        "power_user",
        "casual",
        "browser",
        "dormant_risk",
        "reactivation_target",
      ] as BehavioralSegment[]
    )[i % 5],
    eventsLast30Days: Math.round(W.engagement.homepageViewsPerUser * 12 + (i % 6) * 8),
    lastCampaignInteraction:
      c.lifecycleStage === "churned"
        ? null
        : new Date(Date.now() - i * 172_800_000).toISOString(),
    topActions: [c.primaryDApp, "Homepage", "STW"].slice(0, 2 + (i % 2)),
  }));
}

export const behaviorProfiles = buildBehaviorProfiles(
  getWorkspace("u9"),
  getCustomerAnalytics("u9").customers
);

export const behaviorEvents: BehavioralEvent[] = [
  {
    id: "evt-001",
    customerId: "u9-001",
    type: "campaign_convert",
    action: "Access pass redemption",
    channel: "in_app",
    timestamp: "2026-06-24T09:12:00Z",
    campaignId: "camp-access",
  },
  {
    id: "evt-002",
    customerId: "u9-002",
    type: "promo_click",
    action: "STW spin completed",
    channel: "push",
    timestamp: "2026-06-24T08:45:00Z",
    campaignId: "camp-stw",
  },
  {
    id: "evt-003",
    customerId: "u9-003",
    type: "dapp_browse",
    action: "Quest milestone reached",
    channel: "in_app",
    timestamp: "2026-06-24T08:20:00Z",
  },
  {
    id: "evt-004",
    customerId: "u9-004",
    type: "app_open",
    action: "Homepage session 42s",
    channel: "organic",
    timestamp: "2026-06-24T07:55:00Z",
  },
  {
    id: "evt-005",
    customerId: "u9-005",
    type: "payment",
    action: "eMart BNRY spend",
    channel: "in_app",
    timestamp: "2026-06-24T07:30:00Z",
    campaignId: "camp-emart",
  },
  {
    id: "evt-006",
    customerId: "u9-006",
    type: "promo_view",
    action: "Video reward earned",
    channel: "in_app",
    timestamp: "2026-06-24T06:48:00Z",
  },
  {
    id: "evt-007",
    customerId: "u9-007",
    type: "campaign_open",
    action: "Screen time bonus",
    channel: "push",
    timestamp: "2026-06-24T06:15:00Z",
  },
  {
    id: "evt-008",
    customerId: "u9-008",
    type: "transfer",
    action: "BNRY wallet transfer",
    channel: "in_app",
    timestamp: "2026-06-24T05:40:00Z",
  },
  {
    id: "evt-009",
    customerId: "u9-009",
    type: "campaign_convert",
    action: "STW winner — 500 BNRY",
    channel: "push",
    timestamp: "2026-06-24T04:22:00Z",
    campaignId: "camp-stw",
  },
  {
    id: "evt-010",
    customerId: "u9-010",
    type: "app_open",
    action: "Repeat session (0.08x cohort)",
    channel: "organic",
    timestamp: "2026-06-23T22:10:00Z",
  },
  {
    id: "evt-011",
    customerId: "u9-011",
    type: "promo_click",
    action: "Quest chain step 3",
    channel: "in_app",
    timestamp: "2026-06-23T20:05:00Z",
  },
  {
    id: "evt-012",
    customerId: "u9-012",
    type: "wallet_link",
    action: "Carrier wallet linked",
    channel: "sms",
    timestamp: "2026-06-23T18:30:00Z",
  },
];

export const marketingCampaigns: MarketingCampaign[] = [
  {
    id: "camp-access",
    name: "Access Pass Redemption",
    status: "active",
    type: "retention",
    operator: "telkomsel",
    targetSegment: "power_user",
    channel: "in_app",
    behavioralTrigger: "high_bnry_balance + pass_eligible",
    startDate: "2026-04-01",
    endDate: "2026-07-31",
    budget: 120_000_000,
    spend: 98_400_000,
    impressions: 2_100_000,
    clicks: 420_000,
    conversions: 726_500,
    ctr: 20,
    conversionRate: 99,
    roas: U9.earnBurnRatio,
    cpa: 135,
  },
  {
    id: "camp-stw",
    name: "STW Daily Spin",
    status: "active",
    type: "retention",
    operator: "telkomsel",
    targetSegment: "casual",
    channel: "push",
    behavioralTrigger: "stw_eligible_daily",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    budget: 200_000_000,
    spend: 156_000_000,
    impressions: 8_400_000,
    clicks: 1_890_000,
    conversions: U9.stwWinners30d,
    ctr: 22.5,
    conversionRate: 8.9,
    roas: 4.2,
    cpa: 930,
  },
  {
    id: "camp-quest",
    name: "Quest Completion Push",
    status: "active",
    type: "cross_sell",
    operator: "indosat",
    targetSegment: "browser",
    channel: "in_app",
    behavioralTrigger: "quest_progress_50pct",
    startDate: "2026-05-01",
    endDate: "2026-08-31",
    budget: 85_000_000,
    spend: 52_000_000,
    impressions: 1_800_000,
    clicks: 360_000,
    conversions: 458_100,
    ctr: 20,
    conversionRate: 12.7,
    roas: 3.1,
    cpa: 113,
  },
  {
    id: "camp-emart",
    name: "eMart BNRY Spend",
    status: "active",
    type: "cross_sell",
    operator: "globe",
    targetSegment: "reactivation_target",
    channel: "multi",
    behavioralTrigger: "emart_browser_no_txn",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    budget: 12_000_000,
    spend: 7_500_000,
    impressions: 420_000,
    clicks: 84_000,
    conversions: U9.emartTx30d,
    ctr: 20,
    conversionRate: 1,
    roas: 1.8,
    cpa: 3750,
  },
  {
    id: "camp-screen",
    name: "Screen Time Rewards",
    status: "completed",
    type: "retention",
    operator: "globe",
    targetSegment: "dormant_risk",
    channel: "push",
    behavioralTrigger: "screen_time_threshold",
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    budget: 60_000_000,
    spend: 58_200_000,
    impressions: 2_400_000,
    clicks: 480_000,
    conversions: 537_800,
    ctr: 20,
    conversionRate: 11.2,
    roas: 2.9,
    cpa: 108,
  },
  {
    id: "camp-video",
    name: "Video BNRY Promo",
    status: "scheduled",
    type: "acquisition",
    operator: "telkomsel",
    targetSegment: "casual",
    channel: "in_app",
    behavioralTrigger: "video_ad_completion",
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    budget: 25_000_000,
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 28_900,
    ctr: 0,
    conversionRate: 0,
    roas: 0,
    cpa: 0,
  },
];

export const marketingRecommendations: MarketingRecommendation[] = [
  {
    id: "rec-001",
    title: "Boost STW repeat sessions",
    priority: "high",
    targetSegment: "Repeat session 0.08x cohort",
    behavioralSignal: "Low repeat session multiplier",
    suggestedChannel: "Push + in-app",
    expectedLift: "+12% DAU stickiness",
    estimatedReach: 84000,
    rationale:
      "Stickiness is 3.3% with 0.08x repeat multiplier — nudge STW winners back within 24h.",
  },
  {
    id: "rec-002",
    title: "Expand eMart burn corridor",
    priority: "medium",
    targetSegment: "BNRY holders with zero eMart tx",
    behavioralSignal: "Only 2 eMart tx in 30d",
    suggestedChannel: "In-app + SMS",
    expectedLift: "+0.5% burn mix shift",
    estimatedReach: 125000,
    rationale: "99% of burn goes to access pass; eMart is 1% — room to grow commerce.",
  },
  {
    id: "rec-003",
    title: "Quest reactivation wave",
    priority: "high",
    targetSegment: "Dormant risk · Quest browsers",
    behavioralSignal: "Quest earn 458K but low completion",
    suggestedChannel: "In-app",
    expectedLift: "+8% quest earn",
    estimatedReach: 52000,
    rationale: "Quest is second-largest earn channel after STW; target incomplete chains.",
  },
];

function buildMarketingEngagementSeries(W: WorkspaceMetrics): MarketingEngagementPoint[] {
  const scale = W.mau / U9.mau;
  return [
    {
      date: "Jan",
      events: Math.round(980 * scale),
      engagementScore: 58,
      campaignConversions: Math.round(98_000 * scale),
    },
    {
      date: "Feb",
      events: Math.round(1050 * scale),
      engagementScore: 60,
      campaignConversions: Math.round(112_000 * scale),
    },
    {
      date: "Mar",
      events: Math.round(1120 * scale),
      engagementScore: 61,
      campaignConversions: Math.round(128_000 * scale),
    },
    {
      date: "Apr",
      events: Math.round(1180 * scale),
      engagementScore: 62,
      campaignConversions: Math.round(145_000 * scale),
    },
    {
      date: "May",
      events: Math.round(1260 * scale),
      engagementScore: 64,
      campaignConversions: Math.round(158_000 * scale),
    },
    {
      date: "Jun",
      events: Math.round(W.dau * 1.4),
      engagementScore: Math.round(W.engagement.dauMauStickiness * 19),
      campaignConversions: W.stwWinners30d,
    },
  ];
}

export const marketingEngagementSeries = buildMarketingEngagementSeries(getWorkspace("u9"));

function scaleCampaigns(W: WorkspaceMetrics): MarketingCampaign[] {
  const scale = W.mau / U9.mau;
  return marketingCampaigns.map((c) => ({
    ...c,
    impressions: Math.round(c.impressions * scale),
    clicks: Math.round(c.clicks * scale),
    conversions: Math.round(c.conversions * scale),
    spend: Math.round(c.spend * scale),
    budget: Math.round(c.budget * scale),
    roas: c.id === "camp-access" ? W.earnBurnRatio : c.roas,
  }));
}

export function getMarketingAnalytics(
  workspaceId: WorkspaceId = "u9"
): MarketingAnalyticsSummary {
  const W = getWorkspace(workspaceId);
  const customerData = getCustomerAnalytics(workspaceId);
  const customers = customerData.customers;
  const behaviorProfiles = buildBehaviorProfiles(W, customers);
  const marketingEngagementSeries = buildMarketingEngagementSeries(W);
  const campaigns = scaleCampaigns(W);

  const latest = marketingEngagementSeries[marketingEngagementSeries.length - 1];
  const previous = marketingEngagementSeries[marketingEngagementSeries.length - 2];

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const completedWithSpend = campaigns.filter((c) => c.spend > 0);
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
  const eventsChange = ((latest.events - previous.events) / previous.events) * 100;
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
    { stage: "Subscribers", count: W.workspace.subscribers, rate: 100 },
    {
      stage: "MAU",
      count: W.mau,
      rate: (W.mau / W.workspace.subscribers) * 100,
    },
    { stage: "DAU", count: W.dau, rate: (W.dau / W.mau) * 100 },
    { stage: "BNRY Earn", count: W.bnryEarned30d, rate: 72 },
    { stage: "STW Win", count: W.stwWinners30d, rate: 33.2 },
    { stage: "BNRY Burn", count: W.bnryRedeemed30d, rate: 12.5 },
  ];

  const campaignComparison = campaigns
    .filter((c) => c.spend > 0)
    .map((c) => ({
      name: c.name.split(" ").slice(0, 2).join(" "),
      conversions: c.conversions,
      roas: c.roas,
      spend: c.spend,
    }));

  const channelEffectiveness = [
    { channel: "Push", openRate: 64.2, conversionRate: 15.8 },
    { channel: "In-app", openRate: 82.4, conversionRate: 18.2 },
    { channel: "SMS", openRate: 91.3, conversionRate: 11.2 },
    { channel: "Email", openRate: 22.1, conversionRate: 8.4 },
  ];

  const recentEvents = [...behaviorEvents]
    .map((e, i) => ({
      ...e,
      customerId: customers[i % customers.length].id,
    }))
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
    campaigns,
    recommendations: marketingRecommendations,
    engagementTimeSeries: marketingEngagementSeries,
    eventsByType,
    behavioralSegmentBreakdown,
    journeyStages,
    campaignComparison,
    channelEffectiveness,
  };
}

export function getCustomerWithBehavior(customerId: string, workspaceId: WorkspaceId = "u9") {
  const customerData = getCustomerAnalytics(workspaceId);
  const marketing = getMarketingAnalytics(workspaceId);
  const customer = customerData.customers.find((c) => c.id === customerId);
  const behavior = marketing.behaviorProfiles.find((p) => p.customerId === customerId);
  const events = behaviorEvents.filter((e) => e.customerId === customerId);
  return { customer, behavior, events };
}
