"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, formatPercent } from "@/lib/formatters";
import {
  CHART_AXIS_TICK_SM,
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import type {
  BehaviorCampaignAnalyticsSummary,
  CampaignAnalysisPeriod,
} from "@/types";

const SEGMENT_COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

function formatSegment(segment: string): string {
  return segment.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface BehaviorCampaignAnalysisProps {
  data: BehaviorCampaignAnalyticsSummary;
  period: CampaignAnalysisPeriod;
  onPeriodChange: (period: CampaignAnalysisPeriod) => void;
}

export function BehaviorCampaignAnalysis({
  data,
  period,
  onPeriodChange,
}: BehaviorCampaignAnalysisProps) {
  const latestPeriod = data.timeline[data.timeline.length - 1]?.label ?? "";

  const segmentChartData = useMemo(() => {
    const periods = [...new Set(data.segmentByPeriod.map((s) => s.periodLabel))];
    return periods.map((periodLabel) => {
      const row: Record<string, string | number> = { period: periodLabel };
      data.segmentByPeriod
        .filter((s) => s.periodLabel === periodLabel)
        .forEach((s) => {
          row[s.segment] = s.avgEngagement;
        });
      return row;
    });
  }, [data.segmentByPeriod]);

  const channelLatest = useMemo(() => {
    const labels = [...new Set(data.channelByPeriod.map((c) => c.periodLabel))];
    const last = labels[labels.length - 1];
    return data.channelByPeriod.filter((c) => c.periodLabel === last);
  }, [data.channelByPeriod]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Behavioral campaign analysis</h2>
          <p className="text-sm text-muted-foreground">{data.periodLabel}</p>
        </div>
        <Tabs
          value={period}
          onValueChange={(v) => onPeriodChange(v as CampaignAnalysisPeriod)}
        >
          <TabsList>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly" className="text-xs">Quarterly</TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/80">
          <CardContent className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Behavior events
            </p>
            <p className="mt-1 font-mono text-xl font-bold">
              {formatNumber(data.summary.totalEvents, true)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {formatPercent(data.summary.periodChangeEvents)} vs prior period
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80">
          <CardContent className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Campaign conversions
            </p>
            <p className="mt-1 font-mono text-xl font-bold">
              {formatNumber(data.summary.totalConversions, true)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {formatPercent(data.summary.periodChangeConversions)} vs prior period
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80">
          <CardContent className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Avg engagement
            </p>
            <p className="mt-1 font-mono text-xl font-bold">{data.summary.avgEngagement}</p>
            <p className="text-[10px] text-muted-foreground">
              {data.summary.periodChangeEngagement >= 0 ? "+" : ""}
              {data.summary.periodChangeEngagement} pts last period
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80">
          <CardContent className="p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Top segment
            </p>
            <p className="mt-1 text-sm font-semibold">
              {formatSegment(data.summary.topSegment)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {data.summary.activeCampaigns} active campaigns · {data.summary.avgRoas.toFixed(1)}x ROAS
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartContainer
          title="Campaign performance trend"
          subtitle="Events, conversions, and engagement by period"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.timeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis
                dataKey="label"
                tick={CHART_AXIS_TICK_SM}
                axisLine={{ stroke: CHART_COLORS.border }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => formatNumber(v, true)}
                tick={CHART_AXIS_TICK_SM}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={CHART_AXIS_TICK_SM}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar
                yAxisId="left"
                dataKey="campaignConversions"
                name="Conversions"
                fill="#FF6B00"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="engagementScore"
                name="Engagement"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          title="Segment engagement by period"
          subtitle="Behavioral segment scores across campaign windows"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={segmentChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis
                dataKey="period"
                tick={CHART_AXIS_TICK_SM}
                axisLine={{ stroke: CHART_COLORS.border }}
                tickLine={false}
              />
              <YAxis tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              {SEGMENT_COLORS.map((color, i) => {
                const key = ["power_user", "casual", "browser", "dormant_risk", "reactivation_target"][i];
                return (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={formatSegment(key)}
                    fill={color}
                    radius={[2, 2, 0, 0]}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          title={`Channel response · ${latestPeriod}`}
          subtitle="Open vs conversion rate by outreach channel"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={channelLatest} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
              <XAxis
                dataKey="channel"
                tick={CHART_AXIS_TICK_SM}
                axisLine={{ stroke: CHART_COLORS.border }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tick={CHART_AXIS_TICK_SM}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, ""]} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line
                type="monotone"
                dataKey="openRate"
                name="Open rate"
                stroke="#FF6B00"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="conversionRate"
                name="Conversion rate"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="rounded-lg border border-border bg-card/50">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Campaign behavioral rollup</h3>
          <p className="text-xs text-muted-foreground">
            Triggers, segment lift, and conversions per campaign across {period} windows
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] uppercase">Campaign</TableHead>
                <TableHead className="text-[10px] uppercase">Trigger</TableHead>
                <TableHead className="text-[10px] uppercase">Periods</TableHead>
                <TableHead className="text-right text-[10px] uppercase">Conversions</TableHead>
                <TableHead className="text-right text-[10px] uppercase">ROAS</TableHead>
                <TableHead className="text-right text-[10px] uppercase">Segment lift</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.campaignRollup.map((c) => (
                <TableRow key={c.campaignId} className="font-mono text-xs">
                  <TableCell className="font-sans font-semibold">
                    {c.name}
                    <Badge variant="outline" className="ml-2 text-[9px] capitalize">
                      {c.type.replace("_", "-")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {c.behavioralTrigger}
                  </TableCell>
                  <TableCell>{c.periodsActive}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(c.totalConversions, true)}
                  </TableCell>
                  <TableCell className="text-right">{c.avgRoas.toFixed(1)}x</TableCell>
                  <TableCell className="text-right text-emerald-600">
                    +{c.segmentLift}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
