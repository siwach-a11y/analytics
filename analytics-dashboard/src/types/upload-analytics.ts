export type UploadSourceType = "image" | "pdf" | "excel" | "google-sheets" | "csv";

export type AnalyticsSourceKind = UploadSourceType | "api";

export type NumericColumnStat = {
  name: string;
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
};

export type TranslatedAnalyticsDomain =
  | "subscribers"
  | "engagement"
  | "revenue"
  | "campaigns"
  | "mixed";

export type TranslatedAnalyticsKpi = {
  label: string;
  value: number;
  format: "number" | "percent" | "currency" | "ratio";
  change?: number;
  hint?: string;
};

export type TranslatedTimeSeriesKey = {
  key: string;
  label: string;
};

export type TranslatedAnalytics = {
  domain: TranslatedAnalyticsDomain;
  domainLabel: string;
  summary: string;
  kpis: TranslatedAnalyticsKpi[];
  timeSeries: Record<string, string | number>[];
  seriesKeys: TranslatedTimeSeriesKey[];
  breakdown: { name: string; value: number }[];
  breakdownTitle: string;
};

export type ParsedUpload = Omit<UploadedFileAnalytics, "analytics">;

/** Normalized tabular input for the shared analytics translator */
export type RawAnalyticsInput = {
  id: string;
  name: string;
  sourceKind: AnalyticsSourceKind;
  sourceLabel?: string;
  previewText?: string;
  columns: string[];
  rows: Record<string, string | number>[];
  numericStats: NumericColumnStat[];
  rowCount: number;
  imagePreviewUrl?: string;
  apiEndpoint?: string;
  apiPluginId?: string;
};

export type UploadedFileAnalytics = {
  id: string;
  name: string;
  sourceType: UploadSourceType;
  uploadedAt: string;
  sizeBytes: number;
  columns: string[];
  rows: Record<string, string | number>[];
  numericStats: NumericColumnStat[];
  rowCount: number;
  previewText?: string;
  imagePreviewUrl?: string;
  pageCount?: number;
  sheetName?: string;
  analytics: TranslatedAnalytics;
};
