import type { Customer, CustomerLifecycleStage } from "@/types";
import type { WorkspaceId } from "@/data/workspaces";

export type Customer360Kpi = {
  label: string;
  value: string;
  hint?: string;
};

export type Customer360TimelineEvent = {
  date: string;
  event: string;
  channel: string;
};

export type Customer360Affinity = {
  feature: string;
  share: number;
  bnryVolume: number;
};

export type Customer360Summary = {
  workspaceId: WorkspaceId;
  headline: string;
  kpis: Customer360Kpi[];
  lifecycleMix: Array<{ stage: CustomerLifecycleStage; count: number; share: number }>;
  channelMix: Array<{ channel: string; count: number; share: number }>;
  affinities: Customer360Affinity[];
  timeline: Customer360TimelineEvent[];
  riskAlerts: string[];
  spotlightCustomers: Customer[];
};

export type RfmSegmentSummary = {
  segment: string;
  count: number;
  share: number;
  avgRecencyDays: number;
  avgFrequency: number;
  avgMonetary: number;
  color: string;
  action: string;
};

export type RfmAnalysisSummary = {
  workspaceId: WorkspaceId;
  scoredCustomers: number;
  segments: RfmSegmentSummary[];
  scoreDistribution: Array<{ score: string; count: number }>;
  matrix: Array<{ r: number; f: number; m: number; count: number }>;
};

export type CohortAnalysisRow = {
  cohort: string;
  size: number;
  months: number[];
  avgLtv: number;
  cumulativeRetention: number;
};

export type CohortAnalysisSummary = {
  workspaceId: WorkspaceId;
  retentionMatrix: CohortAnalysisRow[];
  sizeTrend: Array<{ cohort: string; size: number }>;
  ltvByCohort: Array<{ cohort: string; ltv: number }>;
  churnByPeriod: Array<{ period: string; churnRate: number }>;
  summaryKpis: Customer360Kpi[];
};

export type CustomerIntelligenceSummary = {
  customer360: Customer360Summary;
  rfm: RfmAnalysisSummary;
  cohort: CohortAnalysisSummary;
};
