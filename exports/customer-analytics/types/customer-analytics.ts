/** Standalone types for Customer Analytics — copy into your project's types folder */

export type TelecomOperatorId = "telkomsel" | "indosat" | "globe";

export type ClientWalletSegment = "retail" | "premium" | "crypto" | "defi";

export type CustomerLifecycleStage = "new" | "active" | "at_risk" | "churned";

export type CustomerAcquisitionChannel =
  | "referral"
  | "organic"
  | "carrier"
  | "partner"
  | "campaign";

export interface Customer {
  id: string;
  externalId: string;
  operator: TelecomOperatorId;
  primaryDApp: string;
  segment: ClientWalletSegment;
  lifecycleStage: CustomerLifecycleStage;
  country: string;
  ltv: number;
  monthlySpend: number;
  walletCount: number;
  retentionScore: number;
  nps: number;
  acquisitionChannel: CustomerAcquisitionChannel;
  churnRisk: number;
  lastActive: string;
  createdAt: string;
}

export interface CustomerAnalyticsSeriesPoint {
  date: string;
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
}

export interface CohortRetentionRow {
  cohort: string;
  size: number;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
  month4: number;
  month5: number;
  month6: number;
}

export interface CustomerAnalyticsSummary {
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  churnedCustomers: number;
  newCustomersThisMonth: number;
  avgLtv: number;
  avgMonthlySpend: number;
  retentionRate: number;
  churnRate: number;
  npsScore: number;
  totalCustomerChange: number;
  retentionChange: number;
  npsChange: number;
  linkedPairsChange?: number;
  customers: Customer[];
  timeSeries: CustomerAnalyticsSeriesPoint[];
  cohortRetention: CohortRetentionRow[];
  acquisitionFunnel: Array<{ stage: string; count: number; rate: number }>;
  bySegment: Array<{
    segment: ClientWalletSegment;
    count: number;
    avgLtv: number;
  }>;
  byOperator: Array<{
    operator: TelecomOperatorId;
    customers: number;
    retention: number;
    avgLtv: number;
  }>;
  byLifecycle: Array<{ stage: CustomerLifecycleStage; count: number }>;
  byChannel: Array<{
    channel: CustomerAcquisitionChannel;
    count: number;
    conversionRate: number;
  }>;
}
