"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { ChartContainer } from "@/components/charts/chart-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercent, cnChangeColor } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import type { TranslatedAnalytics, TranslatedAnalyticsKpi } from "@/types/upload-analytics";
import { cn } from "@/lib/utils";

const CHART_COLORS_LIST = ["#FF6B00", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

function formatKpiValue(kpi: TranslatedAnalyticsKpi): string {
  switch (kpi.format) {
    case "percent":
      return `${kpi.value}%`;
    case "ratio":
      return `${kpi.value}x`;
    case "currency":
      return formatNumber(kpi.value, true);
    case "number":
      return formatNumber(kpi.value, true);
    default:
      return formatNumber(kpi.value, true);
  }
}

function AnalyticsKpi({ kpi }: { kpi: TranslatedAnalyticsKpi }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {kpi.label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold tracking-tight tabular-nums lg:text-2xl">
        {formatKpiValue(kpi)}
      </p>
      {kpi.change !== undefined && (
        <div className="mt-1 flex items-center gap-1">
          {kpi.change >= 0 ? (
            <TrendingUp className={cn("h-3 w-3", cnChangeColor(kpi.change))} />
          ) : (
            <TrendingDown className={cn("h-3 w-3", cnChangeColor(kpi.change))} />
          )}
          <span className={cn("font-mono text-xs", cnChangeColor(kpi.change))}>
            {formatPercent(kpi.change)}
          </span>
        </div>
      )}
      {kpi.hint && (
        <p className="mt-1 text-[10px] text-muted-foreground">{kpi.hint}</p>
      )}
    </div>
  );
}

export type AnalyticsViewCardProps = {
  id: string;
  name: string;
  domainLabel: string;
  sourceBadge: string;
  analytics: TranslatedAnalytics;
  imagePreviewUrl?: string;
  apiEndpoint?: string;
  onRemove: () => void;
};

export function AnalyticsViewCard({
  id,
  name,
  domainLabel,
  sourceBadge,
  analytics,
  imagePreviewUrl,
  apiEndpoint,
  onRemove,
}: AnalyticsViewCardProps) {
  const hasTrend = analytics.timeSeries.length >= 2 && analytics.seriesKeys.length > 0;
  const hasBreakdown = analytics.breakdown.length >= 2;

  return (
    <Card className="border-primary/20 bg-card/80">
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {domainLabel}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {sourceBadge}
              </Badge>
            </div>
            <h3 className="mt-2 font-semibold tracking-tight">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{analytics.summary}</p>
            {apiEndpoint && (
              <p className="mt-1 font-mono text-[10px] text-muted-foreground/80 truncate">
                {apiEndpoint}
              </p>
            )}
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {analytics.kpis.map((kpi) => (
            <AnalyticsKpi key={kpi.label} kpi={kpi} />
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {hasTrend && (
            <ChartContainer title="Growth trend" subtitle="Time series from analytics pipeline">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analytics.timeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    {analytics.seriesKeys.map((series, i) => (
                      <linearGradient
                        key={series.key}
                        id={`analytics-${id}-${series.key}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={CHART_COLORS_LIST[i % CHART_COLORS_LIST.length]}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor={CHART_COLORS_LIST[i % CHART_COLORS_LIST.length]}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
                  <XAxis
                    dataKey="period"
                    tick={CHART_AXIS_TICK_SM}
                    axisLine={{ stroke: CHART_COLORS.border }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatNumber(v, true)}
                    tick={CHART_AXIS_TICK_SM}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v) => formatNumber(Number(v ?? 0), true)}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {analytics.seriesKeys.map((series, i) => (
                    <Area
                      key={series.key}
                      type="monotone"
                      dataKey={series.key}
                      name={series.label}
                      stroke={CHART_COLORS_LIST[i % CHART_COLORS_LIST.length]}
                      fill={`url(#analytics-${id}-${series.key})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {hasBreakdown && (
            <ChartContainer
              title={analytics.breakdownTitle}
              subtitle="Distribution from analytics pipeline"
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.breakdown} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={CHART_AXIS_TICK_SM}
                    axisLine={{ stroke: CHART_COLORS.border }}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={52}
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
                    {analytics.breakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS_LIST[i % CHART_COLORS_LIST.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        {imagePreviewUrl && (
          <details className="mt-4 rounded-lg border border-border/60 bg-muted/20">
            <summary className="cursor-pointer px-3 py-2 text-xs text-muted-foreground">
              Source picture (reference only)
            </summary>
            <div className="border-t border-border/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreviewUrl}
                alt=""
                className="mx-auto max-h-[160px] rounded-md object-contain opacity-80"
              />
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
