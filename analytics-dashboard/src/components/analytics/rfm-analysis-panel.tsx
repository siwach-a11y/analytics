"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import type { RfmAnalysisSummary } from "@/types/customer-intelligence";

export function RfmAnalysisPanel({ data }: { data: RfmAnalysisSummary }) {
  const scatterData = data.matrix.map((m) => ({
    x: m.r,
    y: m.f,
    z: m.m,
    count: m.count,
    label: `R${m.r} F${m.f} M${m.m}`,
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Recency · Frequency · Monetary scoring across {data.scoredCustomers} subscriber profiles
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartContainer title="RFM segment distribution" subtitle="Subscribers per RFM segment">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data.segments}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis type="number" tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="segment"
                width={100}
                tick={CHART_AXIS_TICK_SM}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Subscribers" radius={[0, 4, 4, 0]}>
                {data.segments.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="RFM score map" subtitle="R vs F (bubble size = M)">
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis
                type="number"
                dataKey="x"
                name="Recency"
                domain={[0.5, 5.5]}
                tick={CHART_AXIS_TICK_SM}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Frequency"
                domain={[0.5, 5.5]}
                tick={CHART_AXIS_TICK_SM}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <ZAxis type="number" dataKey="z" range={[80, 400]} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Scatter data={scatterData} fill="var(--primary)" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.segments.map((seg) => (
          <Card key={seg.segment} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <h3 className="text-sm font-semibold">{seg.segment}</h3>
                <Badge variant="secondary" className="ml-auto text-[9px]">
                  {seg.share.toFixed(1)}%
                </Badge>
              </div>
              <p className="mt-2 font-mono text-xl font-bold tabular-nums">
                {formatNumber(seg.count, true)}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Recency {seg.avgRecencyDays.toFixed(0)}d · F {seg.avgFrequency.toFixed(1)} · M{" "}
                {formatNumber(seg.avgMonetary, true)}
              </p>
              <p className="mt-2 text-xs text-primary">{seg.action}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
