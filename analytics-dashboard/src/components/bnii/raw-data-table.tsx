"use client";

import { RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { RawDataFieldStatus, RawDataSummary } from "@/types/bnii-raw-data";

function statusBadgeClass(status: RawDataFieldStatus): string {
  switch (status) {
    case "live":
    case "live-derived":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "fallback":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    case "unavailable":
      return "border-border bg-muted/40 text-muted-foreground";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function sourceBadgeClass(): string {
  return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";
}

type RawDataTableProps = {
  data: RawDataSummary;
  loading?: boolean;
  onRefresh?: () => void;
};

export function RawDataTable({ data, loading, onRefresh }: RawDataTableProps) {
  const liveLabel =
    data.platform === "telecom"
      ? `${data.liveFieldsTarget} of ${data.totalFields} fields from telecommunications workspace telemetry (not on BNII API)`
      : data.source === "api"
        ? `${data.liveFields} of ${data.totalFields} data fields sourced live from the BNII Analytics API`
        : `${data.liveFieldsTarget} of ${data.totalFields} data fields sourced live from the BNII Analytics API`;

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8e0d4] bg-white shadow-sm dark:border-border dark:bg-card">
      <div className="border-b border-[#e8e0d4] bg-[#faf8f4] px-5 py-4 dark:border-border dark:bg-muted/20">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7f72] dark:text-muted-foreground">
          {data.brandLabel.toUpperCase()} · {data.totalFields} RAW FIELDS · 30-DAY TOTALS
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              {data.flag} {data.brandLabel} · Raw Data
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{liveLabel}</p>
            {data.telcoName ? (
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Partner · {data.telcoName}
                {data.partnerId ? ` · ${data.partnerId.slice(0, 8)}…` : ""}
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-muted-foreground">
                {data.platform === "telecom"
                  ? `${data.country} · ${data.code} telecommunications workspace`
                  : `${data.country} · ${data.code} workspace`}
              </p>
            )}
          </div>
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={loading}
              onClick={onRefresh}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-[#8a7f72]">
                Field ID
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-[#8a7f72]">
                Label
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-[#8a7f72]">
                Source
              </TableHead>
              <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-[#8a7f72]">
                Value (30d)
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-[#8a7f72]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.fieldId} className="border-[#efe8dc] dark:border-border">
                <TableCell className="font-mono text-xs text-foreground/90">{row.fieldId}</TableCell>
                <TableCell className="text-sm">{row.label}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] font-normal", sourceBadgeClass())}
                  >
                    {row.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                  {row.formattedValue}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("gap-1 text-[10px] font-normal", statusBadgeClass(row.status))}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {row.statusLabel}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
