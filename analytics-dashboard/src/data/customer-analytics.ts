import type {
  Customer,
  CustomerAnalyticsSeriesPoint,
  CustomerAnalyticsSummary,
  CohortRetentionRow,
  CustomerLifecycleStage,
  CustomerAcquisitionChannel,
  ClientWalletSegment,
  TelecomOperatorId,
} from "@/types";
import operatorsData from "./telecom-operators.json";
import type { TelecomOperator } from "@/types";
import {
  getWorkspace,
  type WorkspaceId,
  type WorkspaceMetrics,
} from "./workspaces";

const operators = operatorsData as TelecomOperator[];

const FEATURES = ["STW", "Quest", "Screen Time", "Video", "eMart"] as const;
const SEGMENTS: ClientWalletSegment[] = ["retail", "premium", "crypto", "defi"];
const CHANNELS: CustomerAcquisitionChannel[] = [
  "carrier",
  "organic",
  "referral",
  "campaign",
  "partner",
];
const OPS: TelecomOperatorId[] = ["telkomsel", "indosat", "globe"];

function buildTimeSeries(W: WorkspaceMetrics): CustomerAnalyticsSeriesPoint[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const targetSubs = W.workspace.subscribers;
  const targetMau = W.mau;
  return months.map((date, i) => {
    const t = (i + 1) / months.length;
    const total = Math.round(targetSubs * (0.88 + t * 0.12));
    const active = Math.round(targetMau * (0.85 + t * 0.15));
    return {
      date,
      totalCustomers: total,
      activeCustomers: active,
      newCustomers: Math.round(W.stwWinners30d * 0.04 * (0.8 + t * 0.4)),
      churnedCustomers: Math.round(total * 0.004),
    };
  });
}

function buildCustomers(W: WorkspaceMetrics): Customer[] {
  const lifecycles: CustomerLifecycleStage[] = [
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "active",
    "new",
    "new",
    "at_risk",
    "at_risk",
    "at_risk",
    "at_risk",
    "churned",
    "churned",
  ];

  const prefix = W.workspace.id;

  return lifecycles.map((lifecycleStage, i) => {
    const operator = OPS[i % OPS.length];
    const segment = SEGMENTS[i % SEGMENTS.length];
    const feature = FEATURES[i % FEATURES.length];
    const bnryBalance = Math.round(
      W.netBnryPerUser * (0.4 + (i % 5) * 0.35) * 1000
    );
    const monthlyEarn = Math.round(
      (W.bnryEarned30d / W.mau) * (0.5 + (i % 4) * 0.3)
    );
    const churnRisk =
      lifecycleStage === "at_risk"
        ? 55 + (i % 3) * 12
        : lifecycleStage === "churned"
          ? 88
          : 8 + (i % 4) * 5;

    return {
      id: `${prefix}-${String(i + 1).padStart(3, "0")}`,
      externalId: `${W.workspace.code}-****${(1000 + i * 137).toString().slice(-4)}`,
      operator,
      primaryDApp: feature,
      segment,
      lifecycleStage,
      country: W.workspace.country,
      ltv: bnryBalance,
      monthlySpend: lifecycleStage === "churned" ? 0 : monthlyEarn,
      walletCount: 1 + (i % 3),
      retentionScore: lifecycleStage === "active" ? 72 + (i % 5) * 4 : 42,
      nps:
        lifecycleStage === "active"
          ? 28 + (i % 6) * 5
          : lifecycleStage === "new"
            ? 45
            : 5,
      acquisitionChannel: CHANNELS[i % CHANNELS.length],
      churnRisk,
      lastActive: new Date(Date.now() - (i % 8) * 86_400_000).toISOString(),
      createdAt: new Date(2024, i % 12, 1).toISOString(),
    };
  });
}

function buildCohortRetention(W: WorkspaceMetrics): CohortRetentionRow[] {
  const base = Math.round(W.stwWinners30d * 0.08);
  return [
    {
      cohort: "Jan 2026",
      size: base,
      month0: 100,
      month1: 42,
      month2: 28,
      month3: 22,
      month4: 18,
      month5: 15,
      month6: 12,
    },
    {
      cohort: "Dec 2025",
      size: Math.round(base * 0.9),
      month0: 100,
      month1: 44,
      month2: 30,
      month3: 24,
      month4: 19,
      month5: 16,
      month6: 14,
    },
    {
      cohort: "Nov 2025",
      size: Math.round(base * 0.83),
      month0: 100,
      month1: 41,
      month2: 27,
      month3: 21,
      month4: 17,
      month5: 14,
      month6: 11,
    },
  ];
}

export function getCustomerAnalytics(
  workspaceId: WorkspaceId = "u9"
): CustomerAnalyticsSummary {
  const W = getWorkspace(workspaceId);
  const customerAnalyticsSeries = buildTimeSeries(W);
  const customers = buildCustomers(W);
  const cohortRetention = buildCohortRetention(W);

  const latest = customerAnalyticsSeries[customerAnalyticsSeries.length - 1];
  const previous = customerAnalyticsSeries[customerAnalyticsSeries.length - 2];

  const totalCustomers = W.workspace.subscribers;
  const activeCustomers = W.mau;
  const newCustomersThisMonth = Math.round(W.stwWinners30d * 0.06);
  const atRiskCustomers = customers.filter((c) => c.lifecycleStage === "at_risk").length;
  const churnedCustomers = customers.filter((c) => c.lifecycleStage === "churned").length;

  const avgLtv = W.netBnryPerUser * 1000;
  const avgMonthlySpend = Math.round(W.bnryEarned30d / W.mau);

  const retentionRate = W.engagement.dauMauStickiness;
  const prevRetentionRate = retentionRate - 0.4;
  const churnRate = (W.bnryRedeemed30d / W.bnryEarned30d) * 100 * 0.15;
  const npsScore = Math.round(
    customers.reduce((s, c) => s + c.nps, 0) / customers.length
  );

  const totalCustomerChange =
    ((latest.totalCustomers - previous.totalCustomers) / previous.totalCustomers) * 100;
  const retentionChange = retentionRate - prevRetentionRate;
  const npsChange = 4.2;

  const bySegment = SEGMENTS.map((segment) => {
    const segmentCustomers = customers.filter((c) => c.segment === segment);
    return {
      segment,
      count: segmentCustomers.length,
      avgLtv:
        segmentCustomers.reduce((s, c) => s + c.ltv, 0) /
        Math.max(segmentCustomers.length, 1),
    };
  });

  const byOperator = OPS.map((operator) => {
    const op = operators.find((o) => o.id === operator);
    const opCustomers = customers.filter((c) => c.operator === operator);
    const scale = W.mau / 505_700;
    return {
      operator,
      customers: Math.round((op?.activeWallets ?? opCustomers.length * 10000) * scale),
      retention: op?.retention ?? 70,
      avgLtv:
        opCustomers.reduce((s, c) => s + c.ltv, 0) /
        Math.max(opCustomers.length, 1),
    };
  });

  const lifecycleStages: CustomerLifecycleStage[] = [
    "new",
    "active",
    "at_risk",
    "churned",
  ];
  const byLifecycle = lifecycleStages.map((stage) => ({
    stage,
    count: customers.filter((c) => c.lifecycleStage === stage).length,
  }));

  const byChannel = CHANNELS.map((channel) => {
    const channelCustomers = customers.filter((c) => c.acquisitionChannel === channel);
    const converted = channelCustomers.filter(
      (c) => c.lifecycleStage === "active" || c.lifecycleStage === "new"
    ).length;
    return {
      channel,
      count: channelCustomers.length,
      conversionRate: (converted / Math.max(channelCustomers.length, 1)) * 100,
    };
  });

  const acquisitionFunnel = [
    { stage: "Subscribers", count: totalCustomers, rate: 100 },
    {
      stage: "MAU",
      count: activeCustomers,
      rate: (activeCustomers / totalCustomers) * 100,
    },
    {
      stage: "DAU",
      count: W.dau * 30,
      rate: ((W.dau * 30) / totalCustomers) * 100,
    },
    {
      stage: "STW Winners",
      count: W.stwWinners30d,
      rate: (W.stwWinners30d / activeCustomers) * 100,
    },
    {
      stage: "BNRY Earners",
      count: Math.round(activeCustomers * 0.62),
      rate: 62,
    },
  ];

  return {
    totalCustomers,
    activeCustomers,
    atRiskCustomers,
    churnedCustomers,
    newCustomersThisMonth,
    avgLtv,
    avgMonthlySpend,
    retentionRate,
    churnRate,
    npsScore,
    totalCustomerChange,
    retentionChange,
    npsChange,
    customers,
    timeSeries: customerAnalyticsSeries,
    cohortRetention,
    acquisitionFunnel,
    bySegment,
    byOperator,
    byLifecycle,
    byChannel,
  };
}

/** Default U9 sample customers for legacy imports. */
export const customers = getCustomerAnalytics("u9").customers;
