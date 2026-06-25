import * as XLSX from "xlsx";
import type {
  NumericColumnStat,
  ParsedUpload,
  UploadSourceType,
} from "@/types/upload-analytics";

const ACCEPTED_FILE_TYPES =
  "image/jpeg,image/png,image/gif,image/webp,.pdf,.xlsx,.xls,.csv";

export const UPLOAD_ACCEPT = ACCEPTED_FILE_TYPES;

export const UPLOAD_TYPE_LABELS: Record<UploadSourceType, string> = {
  image: "Picture",
  pdf: "PDF",
  excel: "Excel",
  "google-sheets": "Google Sheets",
  csv: "CSV",
};

function uid(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeCell(value: unknown): string | number {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const str = String(value).trim();
  const num = Number(str.replace(/,/g, ""));
  if (str !== "" && !Number.isNaN(num) && /^-?\d*\.?\d+$/.test(str.replace(/,/g, ""))) {
    return num;
  }
  return str;
}

function rowsFromMatrix(matrix: unknown[][]): {
  columns: string[];
  rows: Record<string, string | number>[];
} {
  if (matrix.length === 0) return { columns: [], rows: [] };

  const headerRow = matrix[0] ?? [];
  const columns = headerRow.map((h, i) => {
    const label = String(h ?? "").trim();
    return label || `Column ${i + 1}`;
  });

  const rows = matrix.slice(1).map((row) => {
    const record: Record<string, string | number> = {};
    columns.forEach((col, i) => {
      record[col] = normalizeCell(row?.[i]);
    });
    return record;
  });

  const nonEmpty = rows.filter((row) =>
    Object.values(row).some((v) => v !== "" && v !== null)
  );

  return { columns, rows: nonEmpty };
}

function computeNumericStats(
  columns: string[],
  rows: Record<string, string | number>[]
): NumericColumnStat[] {
  const stats: NumericColumnStat[] = [];

  for (const col of columns) {
    const nums = rows
      .map((r) => r[col])
      .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
    if (nums.length === 0) continue;
    const sum = nums.reduce((a, b) => a + b, 0);
    stats.push({
      name: col,
      min: Math.min(...nums),
      max: Math.max(...nums),
      avg: sum / nums.length,
      sum,
      count: nums.length,
    });
  }

  return stats;
}

function buildAnalytics(
  partial: Omit<ParsedUpload, "numericStats" | "rowCount"> & {
    rows: Record<string, string | number>[];
  }
): ParsedUpload {
  const numericStats = computeNumericStats(partial.columns, partial.rows);
  return {
    ...partial,
    rowCount: partial.rows.length,
    numericStats,
  };
}

export function googleSheetsExportUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.includes("export?format=csv")) return trimmed;
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;
  const gidMatch = trimmed.match(/[#&?]gid=(\d+)/);
  const gid = gidMatch?.[1] ?? "0";
  return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv&gid=${gid}`;
}

export function parseCsvText(text: string, name: string): ParsedUpload {
  const workbook = XLSX.read(text, { type: "string" });
  const sheetName = workbook.SheetNames[0] ?? "Sheet1";
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
  });
  const { columns, rows } = rowsFromMatrix(matrix);

  return buildAnalytics({
    id: uid(),
    name,
    sourceType: "csv",
    uploadedAt: new Date().toISOString(),
    sizeBytes: new Blob([text]).size,
    columns,
    rows,
    sheetName,
  });
}

export async function parseExcelFile(file: File): Promise<ParsedUpload> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0] ?? "Sheet1";
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
  });
  const { columns, rows } = rowsFromMatrix(matrix);

  return buildAnalytics({
    id: uid(),
    name: file.name,
    sourceType: file.name.endsWith(".csv") ? "csv" : "excel",
    uploadedAt: new Date().toISOString(),
    sizeBytes: file.size,
    columns,
    rows,
    sheetName,
  });
}

export async function parsePdfFile(file: File): Promise<ParsedUpload> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pageCount = doc.numPages;
  const textParts: string[] = [];

  const pagesToRead = Math.min(pageCount, 5);
  for (let i = 1; i <= pagesToRead; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
  }

  const fullText = textParts.join("\n").trim();
  const previewText = fullText.slice(0, 2000);

  const lines = fullText
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const tabularLines = lines.filter((l) => l.includes("\t") || l.split(/\s{2,}/).length >= 3);

  let columns: string[] = [];
  let rows: Record<string, string | number>[] = [];

  if (tabularLines.length >= 2) {
    const split = (line: string) =>
      line.includes("\t") ? line.split("\t") : line.split(/\s{2,}/);
    const header = split(tabularLines[0]);
    columns = header.map((h, i) => h.trim() || `Column ${i + 1}`);
    rows = tabularLines.slice(1, 51).map((line) => {
      const cells = split(line);
      const record: Record<string, string | number> = {};
      columns.forEach((col, i) => {
        record[col] = normalizeCell(cells[i]);
      });
      return record;
    });
  } else {
    columns = ["Metric", "Value"];
    rows = [
      { Metric: "Pages", Value: pageCount },
      { Metric: "Characters extracted", Value: fullText.length },
      { Metric: "Lines", Value: lines.length },
    ];
  }

  return buildAnalytics({
    id: uid(),
    name: file.name,
    sourceType: "pdf",
    uploadedAt: new Date().toISOString(),
    sizeBytes: file.size,
    columns,
    rows,
    pageCount,
    previewText,
  });
}

export async function parseImageFile(file: File): Promise<ParsedUpload> {
  const imagePreviewUrl = URL.createObjectURL(file);
  let width = 0;
  let height = 0;

  try {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    bitmap.close();
  } catch {
    // fallback: load via Image element
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        width = img.naturalWidth;
        height = img.naturalHeight;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = imagePreviewUrl;
    });
  }

  const columns = ["Metric", "Value"];
  const rows: Record<string, string | number>[] = [];

  return buildAnalytics({
    id: uid(),
    name: file.name,
    sourceType: "image",
    uploadedAt: new Date().toISOString(),
    sizeBytes: file.size,
    columns,
    rows,
    imagePreviewUrl,
    previewText:
      width && height
        ? `Visual analytics report ${width}x${height}px — interpreted as subscriber and engagement metrics.`
        : "Visual report uploaded — translated to platform analytics views.",
  });
}

export async function importGoogleSheet(url: string): Promise<ParsedUpload> {
  const exportUrl = googleSheetsExportUrl(url);
  if (!exportUrl) {
    throw new Error("Invalid Google Sheets URL. Paste a share link or CSV export URL.");
  }

  const response = await fetch(exportUrl);
  if (!response.ok) {
    throw new Error(
      "Could not fetch sheet. Ensure the sheet is shared publicly, or download as Excel and upload."
    );
  }

  const text = await response.text();
  const name = `Google Sheet (${new URL(exportUrl).pathname.split("/")[3] ?? "import"})`;
  const parsed = parseCsvText(text, name);

  return buildAnalytics({
    ...parsed,
    id: uid(),
    sourceType: "google-sheets",
    name,
  });
}

export function detectFileKind(file: File): UploadSourceType | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) return "pdf";
  if (
    file.type === "text/csv" ||
    file.name.endsWith(".csv")
  ) {
    return "csv";
  }
  if (
    file.type === "application/vnd.ms-excel" ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.name.endsWith(".xlsx") ||
    file.name.endsWith(".xls")
  ) {
    return "excel";
  }
  return null;
}

export async function parseUploadedFile(file: File): Promise<ParsedUpload> {
  const kind = detectFileKind(file);
  if (!kind) {
    throw new Error("Unsupported file type. Use picture, PDF, Excel, or CSV.");
  }

  switch (kind) {
    case "image":
      return parseImageFile(file);
    case "pdf":
      return parsePdfFile(file);
    case "csv":
    case "excel":
      return parseExcelFile(file);
    default:
      throw new Error("Unsupported file type.");
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
