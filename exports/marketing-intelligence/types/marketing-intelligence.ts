/** Standalone types for Marketing Intelligence — copy into your project's types folder */

export type TelecomOperatorId = "telkomsel" | "indosat" | "globe";

export type ClientWalletSegment = "retail" | "premium" | "crypto" | "defi";

export type BehavioralEventType =
  | "app_open"
  | "payment"
  | "transfer"
  | "promo_view"
  | "promo_click"
  | "campaign_open"
  | "campaign_convert"
  | "dapp_browse"
  | "wallet_link";

export type BehavioralSegment =
  | "power_user"
  | "casual"
  | "browser"
  | "dormant_risk"
  | "reactivation_target";

export type CampaignStatus = "active" | "scheduled" | "completed" | "paused";

export type CampaignType =
  | "retention"
  | "acquisition"
  | "reactivation"
  | "cross_sell";

export interface BehavioralEvent {
  id: string;
  customerId: string;
  type: BehavioralEventType;
  action: string;
  channel: "push" | "sms" | "in_app" | "email" | "organic";
  timestamp: string;
  campaignId?: string;
}

export interface CustomerBehaviorProfile {
  customerId: string;
  engagementScore: number;
  sessionFrequency: "daily" | "weekly" | "monthly" | "rare";
  avgSessionMinutes: number;
  preferredChannel: "push" | "sms" | "in_app" | "email";
  behavioralSegment: BehavioralSegment;
  eventsLast30Days: number;
  lastCampaignInteraction: string | null;
  topActions: string[];
}

export interface MarketingCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  operator: TelecomOperatorId;
  targetSegment: BehavioralSegment | ClientWalletSegment;
  channel: "push" | "sms" | "in_app" | "email" | "multi";
  behavioralTrigger: string;
  startDate: string;
  endDate: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  roas: number;
  cpa: number;
}

export interface MarketingRecommendation {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  targetSegment: string;
  behavioralSignal: string;
  suggestedChannel: string;
  expectedLift: string;
  estimatedReach: number;
  rationale: string;
}

export interface MarketingEngagementPoint {
  date: string;
  events: number;
  engagementScore: number;
  campaignConversions: number;
}

export interface MarketingAnalyticsSummary {
  eventsTracked30d: number;
  avgEngagementScore: number;
  activeCampaigns: number;
  avgCampaignRoas: number;
  campaignConversionRate: number;
  engagementChange: number;
  eventsChange: number;
  roasChange: number;
  behaviorProfiles: CustomerBehaviorProfile[];
  recentEvents: BehavioralEvent[];
  campaigns: MarketingCampaign[];
  recommendations: MarketingRecommendation[];
  engagementTimeSeries: MarketingEngagementPoint[];
  eventsByType: Array<{ type: BehavioralEventType; count: number }>;
  behavioralSegmentBreakdown: Array<{
    segment: BehavioralSegment;
    count: number;
    avgEngagement: number;
  }>;
  journeyStages: Array<{ stage: string; count: number; rate: number }>;
  campaignComparison: Array<{
    name: string;
    conversions: number;
    roas: number;
    spend: number;
  }>;
  channelEffectiveness: Array<{
    channel: string;
    openRate: number;
    conversionRate: number;
  }>;
}

/** Minimal customer shape used by behavior-event-feed & behavior-profiles-table */
export interface CustomerRef {
  id: string;
  externalId: string;
  primaryDApp: string;
}
