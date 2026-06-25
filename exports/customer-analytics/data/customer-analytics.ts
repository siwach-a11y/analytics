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

import customersData from "./customers.json";
import customerSeriesData from "./customer-analytics-series.json";
import customerCohortsData from "./customer-cohorts.json";
import operatorsData from "./telecom-operators.json";
import type { TelecomOperator } from "@/types";

const operators = operatorsData as TelecomOperator[];
export const customers = customersData as Customer[];
export const customerAnalyticsSeries =
  customerSeriesData as CustomerAnalyticsSeriesPoint[];
export const cohortRetention = customerCohortsData as CohortRetentionRow[];

export function getCustomerAnalytics(): CustomerAnalyticsSummary {
  const latest = customerAnalyticsSeries[customerAnalyticsSeries.length - 1];
  const previous = customerAnalyticsSeries[customerAnalyticsSeries.length - 2];

  const totalCustomers = latest.totalCustomers;
  const activeCustomers = latest.activeCustomers;
  const newCustomersThisMonth = latest.newCustomers;

  const atRiskCustomers = customers.filter((c) => c.lifecycleStage === "at_risk").length;
  const churnedCustomers = customers.filter((c) => c.lifecycleStage === "churned").length;

  const sampleActive = customers.filter((c) => c.lifecycleStage === "active");
  const avgLtv =
    sampleActive.reduce((s, c) => s + c.ltv, 0) / Math.max(sampleActive.length, 1);
  const avgMonthlySpend =
    customers
      .filter((c) => c.monthlySpend > 0)
      .reduce((s, c) => s + c.monthlySpend, 0) /
    Math.max(customers.filter((c) => c.monthlySpend > 0).length, 1);

  const retentionRate = (activeCustomers / totalCustomers) * 100;
  const prevRetentionRate = (previous.activeCustomers / previous.totalCustomers) * 100;
  const churnRate = (latest.churnedCustomers / totalCustomers) * 100;
  const npsScore = Math.round(
    customers.reduce((s, c) => s + c.nps, 0) / customers.length
  );

  const totalCustomerChange =
    ((latest.totalCustomers - previous.totalCustomers) / previous.totalCustomers) * 100;
  const retentionChange = retentionRate - prevRetentionRate;
  const npsChange = 4.2;

  const segments = [...new Set(customers.map((c) => c.segment))] as ClientWalletSegment[];
  const bySegment = segments.map((segment) => {
    const segmentCustomers = customers.filter((c) => c.segment === segment);
    return {
      segment,
      count: segmentCustomers.length,
      avgLtv:
        segmentCustomers.reduce((s, c) => s + c.ltv, 0) /
        Math.max(segmentCustomers.length, 1),
    };
  });

  const byOperator = (["telkomsel", "indosat", "globe"] as TelecomOperatorId[]).map(
    (operator) => {
      const opCustomers = customers.filter((c) => c.operator === operator);
      const opScale = operators.find((o) => o.id === operator);
      return {
        operator,
        customers: opScale?.activeWallets ?? opCustomers.length * 100000,
        retention: opScale?.retention ?? 75,
        avgLtv:
          opCustomers.reduce((s, c) => s + c.ltv, 0) /
          Math.max(opCustomers.length, 1),
      };
    }
  );

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

  const channels = [
    ...new Set(customers.map((c) => c.acquisitionChannel)),
  ] as CustomerAcquisitionChannel[];
  const byChannel = channels.map((channel) => {
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
    { stage: "Awareness", count: 8200000, rate: 100 },
    { stage: "Signup", count: 6100000, rate: 74.4 },
    { stage: "Wallet Linked", count: 4480000, rate: 54.6 },
    { stage: "First Txn", count: 3920000, rate: 47.8 },
    { stage: "Retained (90d)", count: 3640000, rate: 44.4 },
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
