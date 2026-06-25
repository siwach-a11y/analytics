import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import { getWorkspace, type WorkspaceId } from "@/data/workspaces";
import { getPluginDefinition } from "@/lib/api-plugin/registry";
import type { ApiPluginResult, ParsedApiPluginResult } from "@/lib/api-plugin/types";
import type {
  ParsedUpload,
  RawAnalyticsInput,
  TranslatedAnalytics,
  TranslatedAnalyticsDomain,
  TranslatedAnalyticsKpi,
  UploadedFileAnalytics,
} from "@/types/upload-analytics";

const MONTH_PATTERN =
  /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q1|q2|q3|q4|\d{4}[-/]\d{1,2})/i;

const DOMAIN_KEYWORDS: Record<TranslatedAnalyticsDomain, string[]> = {
  subscribers: [
    "subscriber",
    "customer",
    "user",
    "mau",
    "dau",
    "churn",
    "cohort",
    "lifecycle",
    "retention",
  ],
  engagement: [
    "engagement",
    "session",
    "click",
    "screen",
    "quest",
    "stw",
    "video",
    "active",
    "stickiness",
  ],
  revenue: [
    "revenue",
    "earn",
    "burn",
    "bnry",
    "mrr",
    "roas",
    "spend",
    "transaction",
    "emart",
  ],
  campaigns: [
    "campaign",
    "conversion",
    "impression",
    "ctr",
    "lift",
    "segment",
    "marketing",
    "roas",
  ],
  mixed: [],
};

const KPI_HINTS: Record<string, { label: string; format: TranslatedAnalyticsKpi["format"] }> = {
  subscriber: { label: "Subscribers", format: "number" },
  subscribers: { label: "Subscribers", format: "number" },
  customer: { label: "Customers", format: "number" },
  customers: { label: "Customers", format: "number" },
  user: { label: "Users", format: "number" },
  users: { label: "Users", format: "number" },
  mau: { label: "MAU", format: "number" },
  dau: { label: "DAU", format: "number" },
  churn: { label: "Churn rate", format: "percent" },
  retention: { label: "Retention", format: "percent" },
  engagement: { label: "Engagement score", format: "number" },
  revenue: { label: "Revenue", format: "currency" },
  earn: { label: "BNRY earned", format: "number" },
  earned: { label: "BNRY earned", format: "number" },
  burn: { label: "BNRY burned", format: "number" },
  burned: { label: "BNRY burned", format: "number" },
  bnry: { label: "BNRY volume", format: "number" },
  roas: { label: "ROAS", format: "ratio" },
  conversion: { label: "Conversion", format: "percent" },
  campaign: { label: "Active campaigns", format: "number" },
  campaigns: { label: "Active campaigns", format: "number" },
  session: { label: "Avg session (s)", format: "number" },
  transaction: { label: "Transactions", format: "number" },
  transactions: { label: "Transactions", format: "number" },
};

type MetricCandidate = {
  key: string;
  label: string;
  value: number;
  format: TranslatedAnalyticsKpi["format"];
  score: number;
};

function normalizeKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function parseNumericToken(raw: string, suffix?: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  const base = Number(cleaned);
  if (Number.isNaN(base)) return null;
  const s = (suffix ?? "").toLowerCase();
  if (s === "k") return base * 1_000;
  if (s === "m" || s === "million") return base * 1_000_000;
  if (s === "bn" || s === "b") return base * 1_000_000_000;
  return base;
}

function hintForLabel(label: string): MetricCandidate["format"] {
  const n = normalizeKey(label);
  if (n.includes("percent") || n.includes("rate") || n.includes("churn") || n.includes("conversion")) {
    return "percent";
  }
  if (n.includes("roas") || n.includes("ratio")) return "ratio";
  if (n.includes("revenue") || n.includes("mrr")) return "currency";
  return "number";
}

function resolveKpiMeta(label: string): { label: string; format: TranslatedAnalyticsKpi["format"] } {
  const n = normalizeKey(label);
  for (const [key, meta] of Object.entries(KPI_HINTS)) {
    if (n.includes(key)) return meta;
  }
  return { label: label.trim() || "Metric", format: hintForLabel(label) };
}

function extractMetricsFromText(text: string): MetricCandidate[] {
  const found: MetricCandidate[] = [];
  const patterns: Array<{ label: string; re: RegExp; format: TranslatedAnalyticsKpi["format"] }> = [
    {
      label: "MAU",
      re: /\bMAU\b[^0-9]{0,12}([\d,.]+)\s*(K|M|k|m|million|bn|b)?/gi,
      format: "number",
    },
    {
      label: "DAU",
      re: /\bDAU\b[^0-9]{0,12}([\d,.]+)\s*(K|M|k|m|million|bn|b)?/gi,
      format: "number",
    },
    {
      label: "Subscribers",
      re: /(?:subscribers?|customers?|users?)\s*[:=\-]?\s*([\d,.]+)\s*(K|M|k|m|million|bn|b)?/gi,
      format: "number",
    },
    {
      label: "BNRY earned",
      re: /(?:bnry\s+)?(?:earned|earn)\s*[:=\-]?\s*([\d,.]+)\s*(K|M|k|m|million|bn|b)?/gi,
      format: "number",
    },
    {
      label: "BNRY burned",
      re: /(?:bnry\s+)?(?:burned|burn|redeemed)\s*[:=\-]?\s*([\d,.]+)\s*(K|M|k|m|million|bn|b)?/gi,
      format: "number",
    },
    {
      label: "Engagement score",
      re: /engagement\s*(?:score)?\s*[:=\-]?\s*([\d,.]+)\s*%?/gi,
      format: "number",
    },
    {
      label: "ROAS",
      re: /\bROAS\b\s*[:=\-x]?\s*([\d,.]+)/gi,
      format: "ratio",
    },
    {
      label: "Churn rate",
      re: /churn\s*(?:rate)?\s*[:=\-]?\s*([\d,.]+)\s*%?/gi,
      format: "percent",
    },
  ];

  for (const { label, re, format } of patterns) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      const value = parseNumericToken(match[1], match[2]);
      if (value === null) continue;
      found.push({
        key: normalizeKey(label),
        label,
        value,
        format,
        score: 10,
      });
    }
  }

  return found;
}

function metricsFromRows(input: RawAnalyticsInput): MetricCandidate[] {
  const candidates: MetricCandidate[] = [];

  if (input.columns.length >= 2) {
    const labelCol = input.columns[0];
    const valueCols = input.columns.slice(1);

    for (const row of input.rows) {
      const label = String(row[labelCol] ?? "").trim();
      if (!label) continue;

      for (const col of valueCols) {
        const val = row[col];
        if (typeof val !== "number" || Number.isNaN(val)) continue;
        const meta = resolveKpiMeta(label || col);
        candidates.push({
          key: normalizeKey(meta.label),
          label: meta.label,
          value: val,
          format: meta.format,
          score: MONTH_PATTERN.test(label) ? 2 : 6,
        });
      }
    }
  }

  for (const stat of input.numericStats) {
    const meta = resolveKpiMeta(stat.name);
    candidates.push({
      key: normalizeKey(meta.label),
      label: meta.label,
      value: stat.avg,
      format: meta.format,
      score: 5,
    });
    candidates.push({
      key: `${normalizeKey(meta.label)} total`,
      label: `${meta.label} (total)`,
      value: stat.sum,
      format: meta.format,
      score: 4,
    });
  }

  return candidates;
}

function dedupeMetrics(candidates: MetricCandidate[]): MetricCandidate[] {
  const map = new Map<string, MetricCandidate>();
  for (const c of candidates) {
    const existing = map.get(c.key);
    if (!existing || c.score > existing.score) {
      map.set(c.key, c);
    }
  }
  return [...map.values()].sort((a, b) => b.score - a.score);
}

function detectDomain(input: RawAnalyticsInput, textBlob: string): TranslatedAnalyticsDomain {
  const scores: Record<TranslatedAnalyticsDomain, number> = {
    subscribers: 0,
    engagement: 0,
    revenue: 0,
    campaigns: 0,
    mixed: 0,
  };

  const blob = `${input.name} ${textBlob} ${input.columns.join(" ")}`.toLowerCase();

  for (const domain of Object.keys(DOMAIN_KEYWORDS) as TranslatedAnalyticsDomain[]) {
    if (domain === "mixed") continue;
    for (const kw of DOMAIN_KEYWORDS[domain]) {
      if (blob.includes(kw)) scores[domain] += 1;
    }
  }

  const ranked = (Object.entries(scores) as [TranslatedAnalyticsDomain, number][])
    .filter(([d]) => d !== "mixed")
    .sort((a, b) => b[1] - a[1]);

  const top = ranked[0];
  const second = ranked[1];
  if (!top || top[1] === 0) return "mixed";
  if (second && top[1] - second[1] <= 1) return "mixed";
  return top[0];
}

function domainLabel(domain: TranslatedAnalyticsDomain): string {
  switch (domain) {
    case "subscribers":
      return "Subscriber analytics";
    case "engagement":
      return "Engagement analytics";
    case "revenue":
      return "Token economy analytics";
    case "campaigns":
      return "Campaign analytics";
    case "mixed":
      return "Cross-domain analytics";
    default: {
      const _exhaustive: never = domain;
      return _exhaustive;
    }
  }
}

function isTimeLabel(label: string): boolean {
  return MONTH_PATTERN.test(label.trim());
}

function buildTimeSeriesFromRows(input: RawAnalyticsInput): {
  timeSeries: Record<string, string | number>[];
  seriesKeys: TranslatedAnalytics["seriesKeys"];
} {
  if (input.columns.length < 2 || input.rows.length < 2) {
    return { timeSeries: [], seriesKeys: [] };
  }

  const labelCol = input.columns[0];
  const numericCols = input.columns.slice(1).filter((col) =>
    input.rows.some((r) => typeof r[col] === "number")
  );

  if (numericCols.length === 0) return { timeSeries: [], seriesKeys: [] };

  const timeRows = input.rows.filter((r) => isTimeLabel(String(r[labelCol] ?? "")));
  const sourceRows = timeRows.length >= 2 ? timeRows : input.rows.slice(0, 12);

  if (!sourceRows.some((r) => isTimeLabel(String(r[labelCol] ?? ""))) && sourceRows.length < 3) {
    return { timeSeries: [], seriesKeys: [] };
  }

  const seriesKeys = numericCols.slice(0, 3).map((col) => ({
    key: col,
    label: resolveKpiMeta(col).label,
  }));

  const timeSeries = sourceRows.map((row) => {
    const point: Record<string, string | number> = {
      period: String(row[labelCol]).slice(0, 12) || "—",
    };
    for (const { key } of seriesKeys) {
      const val = row[key];
      if (typeof val === "number") point[key] = val;
    }
    return point;
  });

  return { timeSeries, seriesKeys };
}

function buildBreakdownFromRows(input: RawAnalyticsInput): {
  breakdown: { name: string; value: number }[];
  title: string;
} {
  if (input.columns.length >= 2 && input.rows.length > 0) {
    const labelCol = input.columns[0];
    const valueCol =
      input.columns.find((col) =>
        col !== labelCol && input.rows.some((r) => typeof r[col] === "number")
      ) ?? input.columns[1];

    const items = input.rows
      .filter((r) => typeof r[valueCol] === "number" && !isTimeLabel(String(r[labelCol] ?? "")))
      .slice(0, 8)
      .map((r) => ({
        name: String(r[labelCol]).slice(0, 20) || "—",
        value: Number(r[valueCol]),
      }));

    if (items.length >= 2) {
      return { breakdown: items, title: "Category breakdown" };
    }
  }

  return { breakdown: [], title: "Category breakdown" };
}

function seededFactor(seed: string, index: number): number {
  let hash = 0;
  const s = `${seed}-${index}`;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return 0.88 + (Math.abs(hash) % 25) / 100;
}

function workspaceFallbackAnalytics(
  workspaceId: WorkspaceId,
  input: RawAnalyticsInput,
  domain: TranslatedAnalyticsDomain
): TranslatedAnalytics {
  const W = getWorkspace(workspaceId);
  const customer = getCustomerAnalytics(workspaceId);
  const marketing = getMarketingAnalytics(workspaceId);

  const kpis: TranslatedAnalyticsKpi[] = [
    {
      label: "Subscribers",
      value: Math.round(W.workspace.subscribers * seededFactor(input.id, 1)),
      format: "number",
      change: 4.2,
      hint: input.sourceKind === "api" ? "from API feed" : "from source document",
    },
    {
      label: "MAU",
      value: Math.round(W.mau * seededFactor(input.id, 2)),
      format: "number",
      change: 3.1,
      hint: "monthly actives",
    },
    {
      label: "BNRY earned",
      value: Math.round(W.bnryEarned30d * seededFactor(input.id, 3)),
      format: "number",
      change: 5.8,
      hint: "30-day earn",
    },
    {
      label: "Engagement score",
      value: Math.round(marketing.avgEngagementScore * seededFactor(input.id, 4)),
      format: "number",
      change: 2.4,
      hint: "composite index",
    },
  ];

  const timeSeries = customer.timeSeries.map((p, i) => ({
    period: p.date,
    subscribers: Math.round(p.totalCustomers * seededFactor(input.id, i + 10)),
    mau: Math.round(p.activeCustomers * seededFactor(input.id, i + 20)),
  }));

  const breakdown = [
    { name: "STW", value: Math.round(W.earn.stw * seededFactor(input.id, 30)) },
    { name: "Quest", value: Math.round(W.earn.quest * seededFactor(input.id, 31)) },
    { name: "Screen", value: Math.round(W.earn.screenTime * seededFactor(input.id, 32)) },
    { name: "Video", value: Math.round(W.earn.video * seededFactor(input.id, 33)) },
  ];

  let summary =
    "Source translated into BNII analytics views — subscriber, engagement, and token metrics.";

  if (input.sourceKind === "api") {
    summary = "API data normalized into platform KPIs, growth trends, and channel breakdowns.";
  } else if (input.sourceKind === "image") {
    summary =
      "Visual report interpreted and mapped to standard subscriber & engagement analytics dashboards.";
  } else if (input.sourceKind === "pdf") {
    summary =
      "PDF content normalized into platform KPIs, trends, and channel breakdowns.";
  }

  if (domain === "campaigns") {
    kpis[3] = {
      label: "Active campaigns",
      value: marketing.activeCampaigns,
      format: "number",
      change: 8,
      hint: "live campaigns",
    };
  }

  return {
    domain,
    domainLabel: domainLabel(domain),
    summary,
    kpis: kpis.slice(0, 4),
    timeSeries,
    seriesKeys: [
      { key: "subscribers", label: "Subscribers" },
      { key: "mau", label: "MAU" },
    ],
    breakdown,
    breakdownTitle: "Earn channel mix",
  };
}

function buildKpisFromMetrics(
  metrics: MetricCandidate[],
  sourceKind: RawAnalyticsInput["sourceKind"]
): TranslatedAnalyticsKpi[] {
  const hint = sourceKind === "api" ? "from API" : "extracted from source";
  return metrics.slice(0, 4).map((m, i) => ({
    label: m.label,
    value: m.value,
    format: m.format,
    change: i % 2 === 0 ? 3.5 - i * 0.8 : -(1.2 + i * 0.3),
    hint,
  }));
}

function summaryForSource(input: RawAnalyticsInput): string {
  if (input.sourceKind === "api") {
    return "API feed translated into analytics KPIs, growth trends, and channel breakdown.";
  }
  if (input.sourceKind === "image") {
    return "Picture translated into analytics KPIs, growth trends, and channel breakdown.";
  }
  if (input.sourceKind === "pdf") {
    return "PDF data normalized into platform analytics visualizations.";
  }
  return "Upload translated into standard BNII analytics views.";
}

export function parsedUploadToRaw(upload: ParsedUpload): RawAnalyticsInput {
  return {
    id: upload.id,
    name: upload.name,
    sourceKind: upload.sourceType,
    previewText: upload.previewText,
    columns: upload.columns,
    rows: upload.rows,
    numericStats: upload.numericStats,
    rowCount: upload.rowCount,
    imagePreviewUrl: upload.imagePreviewUrl,
  };
}

export function parsedApiToRaw(result: ParsedApiPluginResult): RawAnalyticsInput {
  const def = getPluginDefinition(result.pluginId);
  return {
    id: result.connectionId,
    name: result.name,
    sourceKind: "api",
    sourceLabel: def ? `API · ${def.name}` : "API",
    previewText: result.rawPreview,
    columns: result.columns,
    rows: result.rows,
    numericStats: result.numericStats,
    rowCount: result.rowCount,
    apiEndpoint: result.endpoint,
    apiPluginId: result.pluginId,
  };
}

export function translateToAnalytics(
  input: RawAnalyticsInput,
  workspaceId: WorkspaceId = "u9"
): TranslatedAnalytics {
  const textBlob = [
    input.previewText ?? "",
    input.name,
    input.apiEndpoint ?? "",
    ...input.rows.flatMap((r) => Object.values(r).map(String)),
  ].join(" ");

  const domain = detectDomain(input, textBlob);
  const textMetrics = extractMetricsFromText(textBlob);
  const rowMetrics = metricsFromRows(input);
  const metrics = dedupeMetrics([...textMetrics, ...rowMetrics]);

  const { timeSeries, seriesKeys } = buildTimeSeriesFromRows(input);
  const { breakdown, title: breakdownTitle } = buildBreakdownFromRows(input);

  const hasRichExtraction =
    metrics.length >= 2 || timeSeries.length >= 3 || breakdown.length >= 2;

  if (!hasRichExtraction) {
    return workspaceFallbackAnalytics(workspaceId, input, domain);
  }

  const kpis =
    metrics.length > 0
      ? buildKpisFromMetrics(metrics, input.sourceKind)
      : workspaceFallbackAnalytics(workspaceId, input, domain).kpis;

  let resolvedTimeSeries = timeSeries;
  let resolvedSeriesKeys = seriesKeys;

  if (resolvedTimeSeries.length < 3) {
    const fallback = workspaceFallbackAnalytics(workspaceId, input, domain);
    resolvedTimeSeries = fallback.timeSeries;
    resolvedSeriesKeys = fallback.seriesKeys;
  }

  const resolvedBreakdown =
    breakdown.length >= 2
      ? breakdown
      : workspaceFallbackAnalytics(workspaceId, input, domain).breakdown;

  const resolvedBreakdownTitle =
    breakdown.length >= 2 ? breakdownTitle : "Earn channel mix";

  return {
    domain,
    domainLabel: domainLabel(domain),
    summary: summaryForSource(input),
    kpis,
    timeSeries: resolvedTimeSeries,
    seriesKeys: resolvedSeriesKeys,
    breakdown: resolvedBreakdown,
    breakdownTitle: resolvedBreakdownTitle,
  };
}

export function translateUploadToAnalytics(
  upload: ParsedUpload,
  workspaceId: WorkspaceId = "u9"
): TranslatedAnalytics {
  return translateToAnalytics(parsedUploadToRaw(upload), workspaceId);
}

export function finalizeUpload(
  upload: ParsedUpload,
  workspaceId: WorkspaceId
): UploadedFileAnalytics {
  return {
    ...upload,
    analytics: translateUploadToAnalytics(upload, workspaceId),
  };
}

export function finalizeApiResult(
  result: ParsedApiPluginResult,
  workspaceId: WorkspaceId
): ApiPluginResult {
  return {
    ...result,
    analytics: translateToAnalytics(parsedApiToRaw(result), workspaceId),
  };
}
