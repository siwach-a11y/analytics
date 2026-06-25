"use client";

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
import { AlertTriangle, Clock, User } from "lucide-react";
import { ChartContainer } from "@/components/charts/chart-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import type { Customer360Summary } from "@/types/customer-intelligence";

const LIFECYCLE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export function Customer360Panel({ data }: { data: Customer360Summary }) {
  const lifecycleChart = data.lifecycleMix.map((l) => ({
    name: l.stage.replace("_", " "),
    value: l.count,
    share: l.share,
  }));

  const affinityChart = data.affinities.map((a) => ({
    name: a.feature,
    value: a.bnryVolume,
    share: a.share,
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{data.headline}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.kpis.map((kpi) => (
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

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Lifecycle mix" subtitle="Subscriber stages in sample cohort">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lifecycleChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis dataKey="name" tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} />
              <YAxis tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {lifecycleChart.map((_, i) => (
                  <Cell key={i} fill={LIFECYCLE_COLORS[i % LIFECYCLE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Earn channel affinity" subtitle="BNRY volume by feature">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={affinityChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis dataKey="name" tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} />
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
              <Bar dataKey="value" name="BNRY" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-primary" />
              Activity timeline
            </div>
            <ul className="mt-3 space-y-2">
              {data.timeline.map((t) => (
                <li
                  key={`${t.date}-${t.event}`}
                  className="flex items-center justify-between text-xs border-b border-border/40 pb-2"
                >
                  <span className="text-muted-foreground">{t.date}</span>
                  <span>{t.event}</span>
                  <Badge variant="outline" className="text-[9px]">{t.channel}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Risk signals
            </div>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {data.riskAlerts.map((alert) => (
                <li key={alert} className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2">
                  {alert}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Spotlight subscribers</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.spotlightCustomers.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 font-medium">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {c.externalId}
              </div>
              <p className="mt-1 text-muted-foreground">
                {c.lifecycleStage} · {c.primaryDApp} · LTV {formatNumber(c.ltv, true)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
