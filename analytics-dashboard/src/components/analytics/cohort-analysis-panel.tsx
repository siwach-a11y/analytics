"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import type { CohortAnalysisSummary } from "@/types/customer-intelligence";

const RETENTION_COLORS = ["#FF6B00", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#14B8A6"];

export function CohortAnalysisPanel({ data }: { data: CohortAnalysisSummary }) {
  const heatmapRows = data.retentionMatrix.map((row) => {
    const point: Record<string, string | number> = { cohort: row.cohort };
    row.months.forEach((v, i) => {
      point[`M${i}`] = v;
    });
    return point;
  });

  const monthKeys =
    heatmapRows.length > 0
      ? Object.keys(heatmapRows[0]).filter((k) => k.startsWith("M"))
      : [];

  const retentionLineData = monthKeys.map((monthKey, mi) => {
    const point: Record<string, string | number> = { month: `M${mi}` };
    data.retentionMatrix.forEach((row) => {
      point[row.cohort] = row.months[mi] ?? 0;
    });
    return point;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.summaryKpis.map((kpi) => (
          <Card key={kpi.label} className="border-border/60 bg-card/50">
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {kpi.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums">{kpi.value}</p>
              {kpi.hint && (
                <p className="mt-1 text-[10px] text-muted-foreground">{kpi.hint}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ChartContainer title="Cohort retention curves" subtitle="Retention % by signup month">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={retentionLineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis dataKey="month" tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              tick={CHART_AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            {data.retentionMatrix.map((row, i) => (
              <Line
                key={row.cohort}
                type="monotone"
                dataKey={row.cohort}
                name={row.cohort}
                stroke={RETENTION_COLORS[i % RETENTION_COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Cohort size trend" subtitle="New subscribers per cohort">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.sizeTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis dataKey="cohort" tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} />
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
              <Bar dataKey="size" name="Subscribers" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="LTV by cohort" subtitle="Average BNRY LTV per signup month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.ltvByCohort} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis dataKey="cohort" tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} />
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
              <Bar dataKey="ltv" name="LTV" radius={[4, 4, 0, 0]}>
                {data.ltvByCohort.map((_, i) => (
                  <Cell key={i} fill={RETENTION_COLORS[i % RETENTION_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <ChartContainer title="Churn rate trend" subtitle="Monthly churn from subscriber time series">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.churnByPeriod} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis dataKey="period" tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} />
            <YAxis tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => `${Number(v).toFixed(2)}%`} />
            <Area
              type="monotone"
              dataKey="churnRate"
              name="Churn %"
              stroke="#EF4444"
              fill="url(#churnGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Retention matrix" subtitle="Cohort × month retention %">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={heatmapRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis dataKey="cohort" tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} />
            <YAxis tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            {monthKeys.map((key, i) => (
              <Bar key={key} dataKey={key} name={key} fill={RETENTION_COLORS[i % RETENTION_COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
