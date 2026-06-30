import catalogFallback from "@/data/bnii-metrics-catalog.json";
import dictionaryFallback from "@/data/bnii-metrics-dictionary.json";
import type { TabularFeed } from "./data-feeds";

export const BNII_ANALYTICS_API_BASE =
  "https://bnii-analytics-api-epgxydm2fa-as.a.run.app";

export const BNII_METRICS_CATALOG_URL = `${BNII_ANALYTICS_API_BASE}/v1/metrics/catalog`;
export const BNII_METRICS_DICTIONARY_URL = `${BNII_ANALYTICS_API_BASE}/v1/metrics/dictionary`;
export const BNII_METRICS_QUERY_URL = `${BNII_ANALYTICS_API_BASE}/v1/metrics/query`;

export type BniiMetricPoint = {
  date: string;
  metrics: Record<string, number | null>;
};

export type BniiPartnerMetricsResult = {
  partner_id: string;
  telco_name?: string | null;
  series: BniiMetricPoint[];
};

export type BniiMetricsQueryResponse = {
  date_from: string;
  date_to: string;
  results: BniiPartnerMetricsResult[];
};

export type BniiMetricsQueryRequest = {
  partnerIds: string[];
  dateFrom: string;
  dateTo: string;
  metrics: string[];
};

export type BniiMetricsCatalog = {
  core_metrics: string[];
  transaction_type_pattern: string;
  transaction_type_fields: string[];
  known_transaction_types: string[];
};

export type BniiMetricsDictionary = {
  metrics: Record<string, string>;
  transaction_type_pattern: string;
  transaction_type_fields: string[];
  known_transaction_types: string[];
  transaction_type_field_descriptions?: Record<string, string>;
  known_transaction_type_descriptions?: Record<string, string>;
  note?: string;
};

async function fetchWithFallback<T>(liveUrl: string, proxyPath: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(liveUrl, { headers: { Accept: "application/json" } });
    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch {
    // CORS or network — try same-origin proxy (dev / server)
  }

  if (typeof window !== "undefined") {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    try {
      const res = await fetch(`${base}${proxyPath}`);
      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch {
      // static export without proxy
    }
  }

  return fallback;
}

export async function fetchBniiMetricsCatalog(): Promise<BniiMetricsCatalog> {
  return fetchWithFallback<BniiMetricsCatalog>(
    BNII_METRICS_CATALOG_URL,
    "/api/bnii/metrics/catalog",
    catalogFallback as BniiMetricsCatalog
  );
}

export async function fetchBniiMetricsDictionary(): Promise<BniiMetricsDictionary> {
  return fetchWithFallback<BniiMetricsDictionary>(
    BNII_METRICS_DICTIONARY_URL,
    "/api/bnii/metrics/dictionary",
    dictionaryFallback as BniiMetricsDictionary
  );
}

export function catalogToTabularFeed(catalog: BniiMetricsCatalog): TabularFeed {
  const columns = ["kind", "name", "detail"];
  const rows: Record<string, string | number>[] = [
    ...catalog.core_metrics.map((metric) => ({
      kind: "core_metric",
      name: metric,
      detail: "allowlisted core column",
    })),
    ...catalog.known_transaction_types.map((txType) => ({
      kind: "transaction_type",
      name: txType,
      detail: catalog.transaction_type_fields.join(", "),
    })),
    {
      kind: "meta",
      name: "transaction_type_pattern",
      detail: catalog.transaction_type_pattern,
    },
  ];

  return {
    columns,
    rows,
    rawPreview: `BNII catalog · ${catalog.core_metrics.length} core metrics · ${catalog.known_transaction_types.length} transaction types`,
  };
}

export function dictionaryToTabularFeed(dictionary: BniiMetricsDictionary): TabularFeed {
  const columns = ["kind", "name", "description"];
  const rows: Record<string, string | number>[] = [
    ...Object.entries(dictionary.metrics).map(([name, description]) => ({
      kind: "core_metric",
      name,
      description,
    })),
    ...Object.entries(dictionary.known_transaction_type_descriptions ?? {}).map(
      ([name, description]) => ({
        kind: "transaction_type",
        name,
        description,
      })
    ),
    ...Object.entries(dictionary.transaction_type_field_descriptions ?? {}).map(
      ([name, description]) => ({
        kind: "transaction_field",
        name,
        description,
      })
    ),
  ];

  if (dictionary.note) {
    rows.push({ kind: "note", name: "api_note", description: dictionary.note });
  }

  return {
    columns,
    rows,
    rawPreview: `BNII dictionary · ${Object.keys(dictionary.metrics).length} metric definitions`,
  };
}

/** Server-side direct fetch (no CORS). */
export async function fetchBniiMetricsCatalogServer(): Promise<BniiMetricsCatalog> {
  try {
    const res = await fetch(BNII_METRICS_CATALOG_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      return (await res.json()) as BniiMetricsCatalog;
    }
  } catch {
    // fall through
  }
  return catalogFallback as BniiMetricsCatalog;
}

export async function fetchBniiMetricsDictionaryServer(): Promise<BniiMetricsDictionary> {
  try {
    const res = await fetch(BNII_METRICS_DICTIONARY_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      return (await res.json()) as BniiMetricsDictionary;
    }
  } catch {
    // fall through
  }
  return dictionaryFallback as BniiMetricsDictionary;
}

export async function loadBniiMetricsCatalog(): Promise<BniiMetricsCatalog> {
  if (typeof window === "undefined") {
    return fetchBniiMetricsCatalogServer();
  }
  return fetchBniiMetricsCatalog();
}

export async function loadBniiMetricsDictionary(): Promise<BniiMetricsDictionary> {
  if (typeof window === "undefined") {
    return fetchBniiMetricsDictionaryServer();
  }
  return fetchBniiMetricsDictionary();
}

function toQueryBody(request: BniiMetricsQueryRequest) {
  return {
    partner_ids: request.partnerIds,
    date_from: request.dateFrom,
    date_to: request.dateTo,
    metrics: request.metrics,
  };
}

export async function queryBniiMetricsServer(
  request: BniiMetricsQueryRequest
): Promise<BniiMetricsQueryResponse> {
  const res = await fetch(BNII_METRICS_QUERY_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toQueryBody(request)),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`BNII metrics query failed (${res.status})`);
  }

  return (await res.json()) as BniiMetricsQueryResponse;
}

export async function queryBniiMetrics(
  request: BniiMetricsQueryRequest
): Promise<BniiMetricsQueryResponse> {
  try {
    const res = await fetch(BNII_METRICS_QUERY_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toQueryBody(request)),
    });
    if (res.ok) {
      return (await res.json()) as BniiMetricsQueryResponse;
    }
  } catch {
    // CORS — try proxy
  }

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const proxyRes = await fetch(`${base}/api/bnii/metrics/query`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!proxyRes.ok) {
    throw new Error(`BNII metrics query failed (${proxyRes.status})`);
  }

  return (await proxyRes.json()) as BniiMetricsQueryResponse;
}
