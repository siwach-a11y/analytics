export type RawDataSource =
  | "BinaryOS Events"
  | "STW Engine"
  | "BNRY Token Ledger"
  | "BnryMart"
  | "GA4 · BNII API";

export type RawDataFieldStatus = "live" | "live-derived" | "fallback" | "unavailable";

export type RawDataFieldDefinition = {
  id: string;
  label: string;
  source: RawDataSource;
  /** BNII API metric keys used for this field */
  apiMetrics: string[];
  aggregation: "sum" | "avg" | "last" | "derived";
  /** For derived fields — sum these field ids from computed values */
  derivedFrom?: string[];
  statusHint?: string;
};

export type RawDataRow = {
  fieldId: string;
  label: string;
  source: RawDataSource;
  value30d: number | null;
  formattedValue: string;
  status: RawDataFieldStatus;
  statusLabel: string;
};

export type RawDataSummary = {
  workspaceId: string;
  brandLabel: string;
  flag: string;
  country: string;
  code: string;
  totalFields: number;
  liveFields: number;
  liveFieldsTarget: number;
  dateFrom: string;
  dateTo: string;
  partnerId: string | null;
  telcoName: string | null;
  source: "api" | "demo";
  fetchedAt: string;
  rows: RawDataRow[];
};

export type RawDataMultiSummary = {
  countries: RawDataSummary[];
  fetchedAt: string;
};
