"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Trash2 } from "lucide-react";
import { ChartContainer } from "@/components/charts/chart-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUploadAnalytics } from "@/components/providers/upload-analytics-provider";
import { formatNumber } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import { formatBytes, UPLOAD_TYPE_LABELS } from "@/lib/upload-analytics";
import type { UploadedFileAnalytics } from "@/types/upload-analytics";

const CHART_COLORS_LIST = ["#FF6B00", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

function buildChartData(upload: UploadedFileAnalytics): { name: string; value: number }[] {
  if (upload.numericStats.length > 0) {
    return upload.numericStats.map((s) => ({
      name: s.name,
      value: s.avg,
    }));
  }

  if (upload.columns.length >= 2 && upload.rows.length > 0) {
    const labelCol = upload.columns[0];
    const valueCol =
      upload.columns.find((col) =>
        upload.rows.some((r) => typeof r[col] === "number")
      ) ?? upload.columns[1];

    return upload.rows
      .filter((r) => typeof r[valueCol] === "number")
      .slice(0, 12)
      .map((r) => ({
        name: String(r[labelCol]).slice(0, 24) || "—",
        value: Number(r[valueCol]),
      }));
  }

  return [];
}

function UploadVizCard({
  upload,
  onRemove,
}: {
  upload: UploadedFileAnalytics;
  onRemove: () => void;
}) {
  const chartData = useMemo(() => buildChartData(upload), [upload]);

  return (
    <Card className="border-primary/20 bg-card/80">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {UPLOAD_TYPE_LABELS[upload.sourceType]}
              </Badge>
              <h3 className="font-semibold">{upload.name}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatBytes(upload.sizeBytes)}
              {upload.pageCount ? ` · ${upload.pageCount} pages` : ""}
              {upload.rowCount > 0 ? ` · ${upload.rowCount} data points` : ""}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {upload.sourceType === "image" && upload.imagePreviewUrl && (
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={upload.imagePreviewUrl}
              alt={upload.name}
              className="mx-auto max-h-[320px] w-full object-contain"
            />
          </div>
        )}

        {upload.sourceType === "pdf" && upload.previewText && (
          <p className="mt-3 line-clamp-4 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            {upload.previewText}
          </p>
        )}

        {chartData.length > 0 && (
          <ChartContainer
            title="Extracted metrics"
            subtitle="Values visualized from your upload"
            className="mt-4 border-0 bg-transparent p-0 shadow-none"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
                <XAxis
                  dataKey="name"
                  tick={CHART_AXIS_TICK_SM}
                  axisLine={{ stroke: CHART_COLORS.border }}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  tickFormatter={(v) => formatNumber(v, true)}
                  tick={CHART_AXIS_TICK_SM}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v) => formatNumber(Number(v ?? 0), true)}
                />
                <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS_LIST[i % CHART_COLORS_LIST.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {upload.numericStats.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {upload.numericStats.slice(0, 6).map((stat) => (
              <div
                key={stat.name}
                className="rounded-md border border-border/60 bg-muted/20 px-3 py-2"
              >
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {stat.name}
                </p>
                <p className="font-mono text-sm font-semibold tabular-nums">
                  {formatNumber(stat.avg, true)}
                  <span className="text-xs font-normal text-muted-foreground"> avg</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  min {formatNumber(stat.min, true)} · max {formatNumber(stat.max, true)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UploadDashboard() {
  const { uploads, removeUpload } = useUploadAnalytics();

  if (uploads.length === 0) {
    return null;
  }

  return (
    <section id="upload-dashboard" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Uploaded data visualizations</h2>
        <p className="text-sm text-muted-foreground">
          Charts and previews generated from your pictures and PDFs
        </p>
      </div>
      <div className="space-y-4">
        {uploads.map((upload) => (
          <UploadVizCard
            key={upload.id}
            upload={upload}
            onRemove={() => removeUpload(upload.id)}
          />
        ))}
      </div>
    </section>
  );
}
