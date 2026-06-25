import type {
  BehavioralSegment,
  BehaviorCampaignAnalyticsSummary,
  CampaignAnalysisPeriod,
  BehaviorCampaignPeriodPoint,
} from "@/types";
import { U9 } from "./u9-constants";
import { getMarketingAnalytics } from "./marketing-analytics";
import { getWorkspace, type WorkspaceId, type WorkspaceMetrics } from "./workspaces";

const SEGMENTS: BehavioralSegment[] = [
  "power_user",
  "casual",
  "browser",
  "dormant_risk",
  "reactivation_target",
];

const CHANNELS = ["Push", "In-app", "SMS", "Email"] as const;

function periodLabels(period: CampaignAnalysisPeriod): { label: string; key: string }[] {
  if (period === "monthly") {
    return [
      { label: "Jan", key: "2026-01" },
      { label: "Feb", key: "2026-02" },
      { label: "Mar", key: "2026-03" },
      { label: "Apr", key: "2026-04" },
      { label: "May", key: "2026-05" },
      { label: "Jun", key: "2026-06" },
      { label: "Jul", key: "2026-07" },
      { label: "Aug", key: "2026-08" },
      { label: "Sep", key: "2026-09" },
      { label: "Oct", key: "2026-10" },
      { label: "Nov", key: "2026-11" },
      { label: "Dec", key: "2026-12" },
    ];
  }
  if (period === "quarterly") {
    return [
      { label: "Q1 2025", key: "2025-Q1" },
      { label: "Q2 2025", key: "2025-Q2" },
      { label: "Q3 2025", key: "2025-Q3" },
      { label: "Q4 2025", key: "2025-Q4" },
      { label: "Q1 2026", key: "2026-Q1" },
      { label: "Q2 2026", key: "2026-Q2" },
    ];
  }
  return [
    { label: "2022", key: "2022" },
    { label: "2023", key: "2023" },
    { label: "2024", key: "2024" },
    { label: "2025", key: "2025" },
    { label: "2026 YTD", key: "2026" },
  ];
}

function buildTimeline(
  period: CampaignAnalysisPeriod,
  W: WorkspaceMetrics,
  marketing: ReturnType<typeof getMarketingAnalytics>
): BehaviorCampaignPeriodPoint[] {
  const labels = periodLabels(period);
  const scale = W.mau / U9.mau;
  const baseRoas = marketing.avgCampaignRoas;
  const activeBase = marketing.activeCampaigns;

  return labels.map(({ label, key }, i) => {
    const t = (i + 1) / labels.length;
    const monthPoint = marketing.engagementTimeSeries[i % marketing.engagementTimeSeries.length];
    const growth = 0.82 + t * 0.28 + (i % 3) * 0.04;
    const events = Math.round(
      (monthPoint?.events ?? W.dau * 1.4) * scale * growth * (period === "yearly" ? 12 : period === "quarterly" ? 3 : 1)
    );
    const conversions = Math.round(
      (monthPoint?.campaignConversions ?? W.stwWinners30d * 0.15) *
        scale *
        growth *
        (period === "yearly" ? 10 : period === "quarterly" ? 2.8 : 1)
    );
    const engagement = Math.min(
      95,
      Math.round((monthPoint?.engagementScore ?? 62) + i * 1.2 + (period === "yearly" ? 4 : 0))
    );
    const spend = Math.round(marketing.campaigns.reduce((s, c) => s + c.spend, 0) * scale * (0.08 + t * 0.04));
    const convRate = marketing.campaignConversionRate * (0.9 + t * 0.15);

    return {
      label,
      periodKey: key,
      events,
      campaignConversions: conversions,
      engagementScore: engagement,
      activeCampaigns: Math.max(1, Math.round(activeBase * (0.7 + t * 0.5))),
      conversionRate: convRate,
      roas: baseRoas * (0.85 + t * 0.2),
      spend,
      newResponders: Math.round(conversions * 0.12),
    };
  });
}

function topSegment(
  marketing: ReturnType<typeof getMarketingAnalytics>
): BehavioralSegment {
  const sorted = [...marketing.behavioralSegmentBreakdown].sort((a, b) => b.count - a.count);
  return sorted[0]?.segment ?? "power_user";
}

export function getBehaviorCampaignAnalytics(
  workspaceId: WorkspaceId = "u9",
  period: CampaignAnalysisPeriod = "monthly"
): BehaviorCampaignAnalyticsSummary {
  const W = getWorkspace(workspaceId);
  const marketing = getMarketingAnalytics(workspaceId);
  const timeline = buildTimeline(period, W, marketing);
  const labels = periodLabels(period);

  const segmentByPeriod = labels.flatMap(({ label }, periodIdx) => {
    return SEGMENTS.map((segment, segIdx) => {
      const base = marketing.behavioralSegmentBreakdown.find((s) => s.segment === segment);
      const count = Math.max(1, Math.round((base?.count ?? 2) * (0.85 + periodIdx * 0.06 + segIdx * 0.02)));
      const avgEngagement = Math.min(
        100,
        Math.round((base?.avgEngagement ?? 55) + periodIdx * 1.5 - segIdx * 2)
      );
      return {
        segment,
        periodLabel: label,
        count,
        avgEngagement,
        campaignResponseRate: Math.round(12 + segIdx * 4 + periodIdx * 2.5),
      };
    });
  });

  const campaignRollup = marketing.campaigns.map((c, i) => ({
    campaignId: c.id,
    name: c.name,
    type: c.type,
    status: c.status,
    periodsActive: Math.min(labels.length, 2 + (i % 4)),
    totalConversions: c.conversions,
    avgRoas: c.roas,
    behavioralTrigger: c.behavioralTrigger,
    segmentLift: Math.round(4 + (i % 5) * 2.4),
  }));

  const channelByPeriod = labels.flatMap(({ label }, i) =>
    CHANNELS.map((channel, chIdx) => {
      const base = marketing.channelEffectiveness.find(
        (c) => c.channel.toLowerCase() === channel.toLowerCase()
      );
      return {
        channel,
        periodLabel: label,
        openRate: Math.min(99, (base?.openRate ?? 50) + i * 0.8 - chIdx * 1.2),
        conversionRate: Math.min(30, (base?.conversionRate ?? 12) + i * 0.4),
        responses: Math.round(W.mau * 0.002 * (1 + chIdx * 0.3) * (1 + i * 0.05)),
      };
    })
  );

  const totalEvents = timeline.reduce((s, p) => s + p.events, 0);
  const totalConversions = timeline.reduce((s, p) => s + p.campaignConversions, 0);
  const last = timeline[timeline.length - 1];
  const prev = timeline[timeline.length - 2] ?? last;
  const avgEngagement =
    timeline.reduce((s, p) => s + p.engagementScore, 0) / Math.max(timeline.length, 1);

  const periodLabel =
    period === "monthly"
      ? "Monthly campaign cycles"
      : period === "quarterly"
        ? "Quarterly campaign cycles"
        : "Yearly campaign cycles";

  return {
    period,
    periodLabel,
    timeline,
    segmentByPeriod,
    campaignRollup,
    channelByPeriod,
    summary: {
      totalEvents,
      totalConversions,
      avgEngagement: Math.round(avgEngagement),
      avgRoas: marketing.avgCampaignRoas,
      activeCampaigns: marketing.activeCampaigns,
      topSegment: topSegment(marketing),
      periodChangeEvents: ((last.events - prev.events) / Math.max(prev.events, 1)) * 100,
      periodChangeConversions:
        ((last.campaignConversions - prev.campaignConversions) /
          Math.max(prev.campaignConversions, 1)) *
        100,
      periodChangeEngagement: last.engagementScore - prev.engagementScore,
    },
  };
}
