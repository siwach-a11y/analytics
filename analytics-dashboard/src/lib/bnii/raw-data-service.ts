import { getWorkspace, type WorkspaceId } from "@/data/workspaces";
import { formatRawValue } from "@/lib/bnii/format-raw-value";
import { getBniiPartnerIfSupported } from "@/lib/bnii/partners";
import {
  BNII_RAW_DATA_WORKSPACE_IDS,
  TELECOM_RAW_DATA_WORKSPACE_IDS,
  type BniiRawDataWorkspaceId,
  type TelecomRawDataWorkspaceId,
} from "@/lib/bnii/raw-data-countries";
import { collectQueryMetrics, RAW_DATA_FIELDS } from "@/lib/bnii/raw-data-fields";
import {
  BNII_METRICS_QUERY_URL,
  queryBniiMetrics,
  queryBniiMetricsServer,
  type BniiMetricPoint,
} from "@/lib/api-plugin/bnii-api";
import type {
  RawDataFieldDefinition,
  RawDataFieldStatus,
  RawDataMultiSummary,
  RawDataPlatform,
  RawDataPlatformSnapshot,
  RawDataRow,
  RawDataSummary,
} from "@/types/bnii-raw-data";

function last30DayRange(): { dateFrom: string; dateTo: string } {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - 29);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { dateFrom: fmt(dateFrom), dateTo: fmt(dateTo) };
}

function sumDailyMetrics(series: BniiMetricPoint[], keys: string[]): number | null {
  if (series.length === 0) return null;

  let total = 0;
  let seen = false;

  for (const point of series) {
    let dayTotal = 0;
    let daySeen = false;
    for (const key of keys) {
      const value = point.metrics[key];
      if (value !== null && value !== undefined) {
        dayTotal += Number(value);
        daySeen = true;
      }
    }
    if (daySeen) {
      total += dayTotal;
      seen = true;
    }
  }

  return seen ? total : null;
}

function avgDailyMetrics(series: BniiMetricPoint[], keys: string[]): number | null {
  if (series.length === 0) return null;

  let total = 0;
  let count = 0;

  for (const point of series) {
    let dayTotal = 0;
    let daySeen = false;
    for (const key of keys) {
      const value = point.metrics[key];
      if (value !== null && value !== undefined) {
        dayTotal += Number(value);
        daySeen = true;
      }
    }
    if (daySeen) {
      total += dayTotal;
      count += 1;
    }
  }

  return count > 0 ? total / count : null;
}

function lastDailyMetrics(series: BniiMetricPoint[], keys: string[]): number | null {
  for (let i = series.length - 1; i >= 0; i -= 1) {
    let total = 0;
    let seen = false;
    for (const key of keys) {
      const value = series[i].metrics[key];
      if (value !== null && value !== undefined) {
        total += Number(value);
        seen = true;
      }
    }
    if (seen) return total;
  }
  return null;
}

function aggregateField(
  field: RawDataFieldDefinition,
  series: BniiMetricPoint[],
  computed: Record<string, number | null>
): number | null {
  switch (field.aggregation) {
    case "sum":
      return sumDailyMetrics(series, field.apiMetrics);
    case "avg":
      return avgDailyMetrics(series, field.apiMetrics);
    case "last":
      return lastDailyMetrics(series, field.apiMetrics);
    case "derived": {
      if (field.id === "unique_users") {
        const newUsers = computed.new_users;
        const repeatUsers = computed.repeat_users;
        if (newUsers === null && repeatUsers === null) return null;
        return (newUsers ?? 0) + (repeatUsers ?? 0);
      }
      if (field.id === "bnry_net") {
        const earned = computed.bnry_earned_total;
        const spent = computed.bnry_spent_total;
        if (earned === null && spent === null) return null;
        return (earned ?? 0) - (spent ?? 0);
      }
      if (field.derivedFrom) {
        let total = 0;
        let seen = false;
        for (const id of field.derivedFrom) {
          const value = computed[id];
          if (value !== null) {
            total += value;
            seen = true;
          }
        }
        return seen ? total : null;
      }
      return null;
    }
    default: {
      const _exhaustive: never = field.aggregation;
      return _exhaustive;
    }
  }
}

function statusLabel(status: RawDataFieldStatus, hint?: string): string {
  switch (status) {
    case "live":
      return hint ? `BNII live · ${hint}` : "BNII live";
    case "live-derived":
      return hint ? `BNII live · ${hint}` : "BNII live · derived";
    case "fallback":
      return "BNII sync pending";
    case "unavailable":
      return "Not exposed by BNII";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function telecomStatusLabel(status: RawDataFieldStatus, hint?: string): string {
  switch (status) {
    case "live":
      return hint ? `Telecom telemetry · ${hint}` : "Telecom telemetry";
    case "live-derived":
      return hint ? `Telecom telemetry · ${hint}` : "Telecom telemetry · derived";
    case "fallback":
      return "Telecom sync pending";
    case "unavailable":
      return "Not exposed by telecom stack";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function rowStatusLabel(
  status: RawDataFieldStatus,
  platform: RawDataPlatform,
  hint?: string
): string {
  return platform === "telecom" ? telecomStatusLabel(status, hint) : statusLabel(status, hint);
}

function applyUnavailableFields(
  rows: RawDataRow[],
  unavailableFields: string[]
): RawDataRow[] {
  if (unavailableFields.length === 0) {
    return rows;
  }

  const blocked = new Set(unavailableFields);
  return rows.map((row) => {
    if (!blocked.has(row.fieldId)) {
      return row;
    }
    return {
      ...row,
      value30d: null,
      formattedValue: "—",
      status: "unavailable",
      statusLabel: "Not available",
    };
  });
}

function buildRowsFromSeries(
  series: BniiMetricPoint[],
  source: "api" | "demo",
  unavailableFields: string[],
  platform: RawDataPlatform
): RawDataRow[] {
  const computed: Record<string, number | null> = {};
  const nonDerived = RAW_DATA_FIELDS.filter((f) => f.aggregation !== "derived");
  const derived = RAW_DATA_FIELDS.filter((f) => f.aggregation === "derived");

  for (const field of nonDerived) {
    computed[field.id] = aggregateField(field, series, computed);
  }
  for (const field of derived) {
    computed[field.id] = aggregateField(field, series, computed);
  }

  const blocked = new Set(unavailableFields);
  const rows: RawDataRow[] = RAW_DATA_FIELDS.map((field) => {
    if (blocked.has(field.id)) {
      return {
        fieldId: field.id,
        label: field.label,
        source: field.source,
        value30d: null,
        formattedValue: "—",
        status: "unavailable",
        statusLabel: rowStatusLabel("unavailable", platform),
      };
    }

    const value30d = computed[field.id] ?? null;

    let status: RawDataFieldStatus;
    if (value30d === null) {
      status = source === "api" ? "unavailable" : "fallback";
    } else if (field.aggregation === "derived") {
      status = "live-derived";
    } else {
      status = "live";
    }

    return {
      fieldId: field.id,
      label: field.label,
      source: field.source,
      value30d,
      formattedValue: formatRawValue(value30d),
      status,
      statusLabel: rowStatusLabel(status, platform, field.statusHint),
    };
  });

  return applyUnavailableFields(rows, unavailableFields);
}

function countLiveRows(rows: RawDataRow[]): number {
  return rows.filter((row) => row.status !== "unavailable").length;
}

/** Country-scaled demo series from workspace KPIs */
function workspaceDemoSeries(workspaceId: WorkspaceId): BniiMetricPoint[] {
  const w = getWorkspace(workspaceId);
  const dau = w.dau;
  const newUsers = Math.max(1, Math.round(dau * 0.095));
  const repeatUsers = Math.max(0, dau - newUsers);

  return [
    {
      date: new Date().toISOString().slice(0, 10),
      metrics: {
        new_users: newUsers,
        repeated_users: repeatUsers,
        total_views_homepage: Math.round(dau * w.engagement.homepageViewsPerUser * 30),
        avg_time_spent_seconds: w.engagement.avgSessionSeconds,
        total_user_games: Math.max(0, Math.round(dau * w.engagement.gameClicksPerUser * 30)),
        unique_spin_users: w.stwWinners30d,
        total_bnry_tokens_earned: w.bnryEarned30d,
        total_spin_win_tokens: w.earn.stw,
        total_bnry_tokens_spent: w.bnryRedeemed30d,
        total_transactions: Math.max(0, w.emartTx30d + Math.round(w.stwWinners30d * 0.5)),
        total_credit: w.bnryEarned30d,
        total_debit: w.bnryRedeemed30d,
        dau_ga: Math.round(dau * 0.85),
        mau_ga: w.mau,
        total_spin_usage: w.stwWinners30d,
        "tx.use_pass.unique_users": Math.max(1, Math.round(w.burn.accessPass.volume / 100)),
        "tx.use_pass.amount": w.burn.accessPass.volume,
        "tx.FOLLOW_GIVEN.amount": w.earn.video * 0.35,
        "tx.LIKE_GIVEN.amount": w.earn.video * 0.65,
        "tx.online_reward.amount": w.earn.screenTime,
        "tx.purchase.amount": w.earn.topup,
        "tx.QUEST_REWARD.amount": w.earn.quest,
        "tx.QUEST_REWARD.count": Math.max(0, Math.round(w.earn.quest / 100)),
        "tx.QUEST_REWARD.unique_users": Math.max(1, Math.round(w.mau * 0.04)),
        "tx.ecoupon_purchase.amount": w.burn.emartSpend.volume * 0.6,
        "tx.voucher_redemption.amount": w.burn.emartSpend.volume * 0.4,
        "tx.ecoupon_purchase.count": Math.max(0, w.emartTx30d),
        "tx.voucher_redemption.count": Math.max(0, w.emartTx30d - 1),
        "tx.used_spin_wheel.count": w.stwWinners30d,
      },
    },
  ];
}

function buildSummary(
  workspaceId: WorkspaceId,
  platform: RawDataPlatform,
  rows: RawDataRow[],
  partial: Pick<
    RawDataSummary,
    "dateFrom" | "dateTo" | "partnerId" | "telcoName" | "source"
  >
): RawDataSummary {
  const ws = getWorkspace(workspaceId);
  const brandLabel = ws.rawDataBrand;
  const liveFieldsTarget = ws.rawDataLiveFields;

  return {
    workspaceId,
    brandLabel,
    flag: ws.workspace.flag,
    country: ws.workspace.country,
    code: ws.workspace.code,
    platform,
    totalFields: RAW_DATA_FIELDS.length,
    liveFields: Math.min(liveFieldsTarget, countLiveRows(rows)),
    liveFieldsTarget,
    fetchedAt: new Date().toISOString(),
    rows,
    ...partial,
  };
}

export async function fetchRawDataSummary(
  workspaceId: BniiRawDataWorkspaceId
): Promise<RawDataSummary> {
  const ws = getWorkspace(workspaceId);
  const partner = getBniiPartnerIfSupported(workspaceId)!;
  const unavailableFields = ws.rawDataUnavailableFields ?? [];
  const { dateFrom, dateTo } = last30DayRange();
  const metrics = collectQueryMetrics();

  if (partner.partnerId) {
    try {
      const query =
        typeof window === "undefined"
          ? await queryBniiMetricsServer({
              partnerIds: [partner.partnerId],
              dateFrom,
              dateTo,
              metrics,
            })
          : await queryBniiMetrics({
              partnerIds: [partner.partnerId],
              dateFrom,
              dateTo,
              metrics,
            });

      const result = query.results[0];
      if (result?.series?.length) {
        const rows = buildRowsFromSeries(result.series, "api", unavailableFields, "bnii");
        return buildSummary(workspaceId, "bnii", rows, {
          dateFrom,
          dateTo,
          partnerId: result.partner_id,
          telcoName: result.telco_name ?? null,
          source: "api",
        });
      }
    } catch {
      // fall through to country demo series
    }
  }

  const rows = buildRowsFromSeries(
    workspaceDemoSeries(workspaceId),
    "demo",
    unavailableFields,
    "bnii"
  );

  return buildSummary(workspaceId, "bnii", rows, {
    dateFrom,
    dateTo,
    partnerId: partner.partnerId || null,
    telcoName: null,
    source: "demo",
  });
}

export async function fetchTelecomRawDataSummary(
  workspaceId: TelecomRawDataWorkspaceId = "u3"
): Promise<RawDataSummary> {
  const ws = getWorkspace(workspaceId);
  const unavailableFields = ws.rawDataUnavailableFields ?? [];
  const { dateFrom, dateTo } = last30DayRange();
  const rows = buildRowsFromSeries(
    workspaceDemoSeries(workspaceId),
    "demo",
    unavailableFields,
    "telecom"
  );

  return buildSummary(workspaceId, "telecom", rows, {
    dateFrom,
    dateTo,
    partnerId: null,
    telcoName: null,
    source: "demo",
  });
}

export async function fetchRawDataPlatformSnapshot(): Promise<RawDataPlatformSnapshot> {
  const fetchedAt = new Date().toISOString();
  const [bniiCountries, telecomCountries] = await Promise.all([
    Promise.all(BNII_RAW_DATA_WORKSPACE_IDS.map((id) => fetchRawDataSummary(id))),
    Promise.all(TELECOM_RAW_DATA_WORKSPACE_IDS.map((id) => fetchTelecomRawDataSummary(id))),
  ]);

  return {
    bnii: { countries: bniiCountries, fetchedAt },
    telecom: { countries: telecomCountries, fetchedAt },
    fetchedAt,
  };
}

/** @deprecated Use fetchRawDataPlatformSnapshot */
export async function fetchAllRawDataSummaries(): Promise<RawDataMultiSummary> {
  const snapshot = await fetchRawDataPlatformSnapshot();
  return snapshot.bnii;
}

export { BNII_METRICS_QUERY_URL };
