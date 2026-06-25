export type UploadSourceType = "image" | "pdf" | "excel" | "google-sheets" | "csv";

export type NumericColumnStat = {
  name: string;
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
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
};
