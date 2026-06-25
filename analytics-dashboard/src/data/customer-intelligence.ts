import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import { getWorkspace, type WorkspaceId } from "@/data/workspaces";
import { seededRandom } from "@/lib/clustering/math";
import type { Customer } from "@/types";
import type {
  Customer360Summary,
  CustomerIntelligenceSummary,
  CohortAnalysisSummary,
  RfmAnalysisSummary,
  RfmSegmentSummary,
} from "@/types/customer-intelligence";

const RFM_COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
  "#84CC16",
  "#F97316",
  "#64748B",
];

function daysSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function scoreFromValue(value: number, breaks: number[]): number {
  for (let i = 0; i < breaks.length; i++) {
    if (value <= breaks[i]) return 5 - i;
  }
  return 1;
}

function rfmSegmentLabel(r: number, f: number, m: number): string {
  const sum = r + f + m;
  if (r >= 4 && f >= 4 && m >= 4) return "Champions";
  if (r >= 3 && f >= 3 && m >= 4) return "Loyal Customers";
  if (r >= 4 && f <= 2 && m >= 3) return "Recent Customers";
  if (r >= 3 && f >= 2 && m >= 2) return "Potential Loyalists";
  if (r >= 4 && f <= 2 && m <= 2) return "Promising";
  if (r <= 2 && f >= 3 && m >= 3) return "Can't Lose Them";
  if (r <= 2 && f >= 2 && m >= 2) return "At Risk";
  if (r <= 2 && f <= 2 && m >= 3) return "Hibernating";
  if (sum <= 6) return "Lost";
  return "Needs Attention";
}

function rfmAction(segment: string): string {
  const map: Record<string, string> = {
    Champions: "Reward & upsell premium earn",
    "Loyal Customers": "Nurture with Quest streaks",
    "Recent Customers": "Onboard to STW + Screen Time",
    "Potential Loyalists": "Increase frequency campaigns",
    Promising: "Build habit with micro-rewards",
    "Can't Lose Them": "Win-back with BNRY bonus",
    "At Risk": "Retention push + carrier bundle",
    Hibernating: "Reactivation nudges",
    Lost: "Low-cost survey / pause outreach",
    "Needs Attention": "Targeted engagement test",
  };
  return map[segment] ?? "Monitor";
}

function expandCustomers(workspaceId: WorkspaceId, base: Customer[], target = 120): Customer[] {
  if (base.length >= target) return base.slice(0, target);
  const rand = seededRandom(workspaceId.charCodeAt(0) * 100);
  const out: Customer[] = [...base];
  while (out.length < target) {
    const t = base[out.length % base.length];
    const i = out.length;
    out.push({
      ...t,
      id: `${workspaceId}-rfm-${i}`,
      externalId: `${t.externalId.slice(0, 4)}${i}`,
      monthlySpend: Math.round(t.monthlySpend * (0.7 + rand() * 0.6)),
      ltv: Math.round(t.ltv * (0.75 + rand() * 0.5)),
      walletCount: Math.max(1, t.walletCount + (i % 3) - 1),
      lastActive: new Date(Date.now() - Math.round(rand() * 60) * 86_400_000).toISOString(),
    });
  }
  return out;
}

function buildCustomer360(workspaceId: WorkspaceId): Customer360Summary {
  const W = getWorkspace(workspaceId);
  const customer = getCustomerAnalytics(workspaceId);
  const marketing = getMarketingAnalytics(workspaceId);
  const ws = W.workspace;

  const lifecycleMix = customer.byLifecycle.map((l) => ({
    stage: l.stage,
    count: l.count,
    share: (l.count / Math.max(customer.customers.length, 1)) * 100,
  }));

  const channelMix = customer.byChannel.map((c) => ({
    channel: c.channel,
    count: c.count,
    share: (c.count / Math.max(customer.customers.length, 1)) * 100,
  }));

  const affinities = [
    { feature: "STW", share: 32, bnryVolume: W.earn.stw },
    { feature: "Quest", share: 24, bnryVolume: W.earn.quest },
    { feature: "Screen Time", share: 22, bnryVolume: W.earn.screenTime },
    { feature: "Video", share: 18, bnryVolume: W.earn.video },
    { feature: "eMart", share: 14, bnryVolume: W.burn.emartSpend.volume },
  ];

  const timeline: Customer360Summary["timeline"] = [
    { date: "Today", event: "MAU pulse", channel: "App" },
    { date: "Yesterday", event: "STW win spike", channel: "STW" },
    { date: "2d ago", event: "Quest completion batch", channel: "Quest" },
    { date: "3d ago", event: "Carrier top-up cohort", channel: "Carrier" },
    { date: "5d ago", event: "Campaign impression lift", channel: "Marketing" },
  ];

  const riskAlerts = [
    `${customer.atRiskCustomers} subscribers flagged at-risk in sample cohort`,
    `Churn velocity ${customer.churnRate.toFixed(1)}% vs earn/burn ${W.earnBurnRatio}x`,
    `${marketing.behavioralSegmentBreakdown[0]?.segment ?? "Passive"} segment growing in engagement feed`,
  ];

  return {
    workspaceId,
    headline: `Unified view of ${ws.name} subscribers — identity, value, engagement, and risk`,
    kpis: [
      {
        label: "Total subscribers",
        value: Intl.NumberFormat("en-US", { notation: "compact" }).format(ws.subscribers),
        hint: ws.country,
      },
      {
        label: "Active (MAU)",
        value: Intl.NumberFormat("en-US", { notation: "compact" }).format(W.mau),
        hint: `${W.engagement.dauMauStickiness}% stickiness`,
      },
      {
        label: "Avg LTV (BNRY)",
        value: Intl.NumberFormat("en-US", { notation: "compact" }).format(customer.avgLtv),
        hint: "sample cohort",
      },
      {
        label: "NPS",
        value: String(customer.npsScore),
        hint: `Δ ${customer.npsChange > 0 ? "+" : ""}${customer.npsChange}`,
      },
      {
        label: "Engagement score",
        value: String(marketing.avgEngagementScore),
        hint: "composite index",
      },
      {
        label: "At-risk count",
        value: String(customer.atRiskCustomers),
        hint: "needs retention",
      },
    ],
    lifecycleMix,
    channelMix,
    affinities,
    timeline,
    riskAlerts,
    spotlightCustomers: customer.customers.slice(0, 6),
  };
}

function buildRfm(workspaceId: WorkspaceId): RfmAnalysisSummary {
  const base = getCustomerAnalytics(workspaceId).customers;
  const customers = expandCustomers(workspaceId, base);

  const recencyDays = customers.map((c) => daysSince(c.lastActive));
  const frequency = customers.map((c) => c.walletCount + c.retentionScore / 25);
  const monetary = customers.map((c) => c.monthlySpend);

  const rBreaks = [
    percentile(recencyDays, 0.2),
    percentile(recencyDays, 0.4),
    percentile(recencyDays, 0.6),
    percentile(recencyDays, 0.8),
  ];
  const fBreaks = [
    percentile(frequency, 0.2),
    percentile(frequency, 0.4),
    percentile(frequency, 0.6),
    percentile(frequency, 0.8),
  ];
  const mBreaks = [
    percentile(monetary, 0.2),
    percentile(monetary, 0.4),
    percentile(monetary, 0.6),
    percentile(monetary, 0.8),
  ];

  const segmentMap = new Map<
    string,
    { count: number; recency: number[]; frequency: number[]; monetary: number[] }
  >();

  const matrixMap = new Map<string, number>();

  customers.forEach((c, i) => {
    const r = scoreFromValue(recencyDays[i], rBreaks);
    const f = scoreFromValue(frequency[i], fBreaks);
    const m = scoreFromValue(monetary[i], mBreaks);
    const label = rfmSegmentLabel(r, f, m);
    const bucket = segmentMap.get(label) ?? {
      count: 0,
      recency: [],
      frequency: [],
      monetary: [],
    };
    bucket.count++;
    bucket.recency.push(recencyDays[i]);
    bucket.frequency.push(frequency[i]);
    bucket.monetary.push(monetary[i]);
    segmentMap.set(label, bucket);

    const key = `${r}-${f}-${m}`;
    matrixMap.set(key, (matrixMap.get(key) ?? 0) + 1);
  });

  const segments: RfmSegmentSummary[] = [...segmentMap.entries()]
    .map(([segment, data], idx) => ({
      segment,
      count: data.count,
      share: (data.count / customers.length) * 100,
      avgRecencyDays:
        data.recency.reduce((a, b) => a + b, 0) / Math.max(data.recency.length, 1),
      avgFrequency:
        data.frequency.reduce((a, b) => a + b, 0) / Math.max(data.frequency.length, 1),
      avgMonetary:
        data.monetary.reduce((a, b) => a + b, 0) / Math.max(data.monetary.length, 1),
      color: RFM_COLORS[idx % RFM_COLORS.length],
      action: rfmAction(segment),
    }))
    .sort((a, b) => b.count - a.count);

  const scoreDistribution = segments.map((s) => ({
    score: s.segment,
    count: s.count,
  }));

  const matrix = [...matrixMap.entries()].map(([key, count]) => {
    const [r, f, m] = key.split("-").map(Number);
    return { r, f, m, count };
  });

  return {
    workspaceId,
    scoredCustomers: customers.length,
    segments,
    scoreDistribution,
    matrix,
  };
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * p);
  return sorted[idx] ?? sorted[sorted.length - 1] ?? 0;
}

function buildCohortAnalysis(workspaceId: WorkspaceId): CohortAnalysisSummary {
  const customer = getCustomerAnalytics(workspaceId);
  const W = getWorkspace(workspaceId);

  const retentionMatrix: CohortAnalysisSummary["retentionMatrix"] = customer.cohortRetention.map(
    (row, i) => {
      const months = [
        row.month0,
        row.month1,
        row.month2,
        row.month3,
        row.month4,
        row.month5,
        row.month6,
      ].filter((v) => v > 0);
      const cumulativeRetention = months[months.length - 1] ?? row.month0;
      return {
        cohort: row.cohort,
        size: row.size,
        months,
        avgLtv: Math.round(customer.avgLtv * (0.85 + i * 0.04)),
        cumulativeRetention,
      };
    }
  );

  const sizeTrend = customer.cohortRetention.map((r) => ({
    cohort: r.cohort,
    size: r.size,
  }));

  const ltvByCohort = retentionMatrix.map((r) => ({
    cohort: r.cohort,
    ltv: r.avgLtv,
  }));

  const churnByPeriod = customer.timeSeries.map((p) => ({
    period: p.date,
    churnRate: (p.churnedCustomers / Math.max(p.totalCustomers, 1)) * 100,
  }));

  return {
    workspaceId,
    retentionMatrix,
    sizeTrend,
    ltvByCohort,
    churnByPeriod,
    summaryKpis: [
      {
        label: "Active cohorts",
        value: String(retentionMatrix.length),
        hint: "tracked monthly",
      },
      {
        label: "Best retention",
        value: `${Math.max(...retentionMatrix.map((r) => r.cumulativeRetention))}%`,
        hint: "latest cohort M6",
      },
      {
        label: "Cohort BNRY LTV",
        value: Intl.NumberFormat("en-US", { notation: "compact" }).format(
          Math.round(customer.avgLtv * 1.1)
        ),
        hint: "avg across cohorts",
      },
      {
        label: "STW winners (30d)",
        value: Intl.NumberFormat("en-US", { notation: "compact" }).format(W.stwWinners30d),
        hint: "conversion proxy",
      },
    ],
  };
}

export function getCustomerIntelligence(
  workspaceId: WorkspaceId = "u9"
): CustomerIntelligenceSummary {
  return {
    customer360: buildCustomer360(workspaceId),
    rfm: buildRfm(workspaceId),
    cohort: buildCohortAnalysis(workspaceId),
  };
}

export function getCustomer360(workspaceId: WorkspaceId = "u9"): Customer360Summary {
  return buildCustomer360(workspaceId);
}

export function getRfmAnalysis(workspaceId: WorkspaceId = "u9"): RfmAnalysisSummary {
  return buildRfm(workspaceId);
}

export function getCohortAnalysis(workspaceId: WorkspaceId = "u9"): CohortAnalysisSummary {
  return buildCohortAnalysis(workspaceId);
}
