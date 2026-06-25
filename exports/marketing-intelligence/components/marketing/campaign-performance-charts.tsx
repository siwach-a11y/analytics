"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";
import { formatNumber } from "@/lib/formatters";
import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  CHART_AXIS_TICK_SM,
} from "@/lib/chart-theme";
import type { MarketingAnalyticsSummary } from "@/types";

const BAR_COLORS = ["#FF6B00", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#E4002B"];

interface CampaignPerformanceChartsProps {
  campaignComparison: MarketingAnalyticsSummary["campaignComparison"];
  engagementTimeSeries: MarketingAnalyticsSummary["engagementTimeSeries"];
}

export function CampaignPerformanceCharts({
  campaignComparison,
  engagementTimeSeries,
}: CampaignPerformanceChartsProps) {
  const conversionTrend = engagementTimeSeries.map((p) => ({
    date: p.date,
    conversions: p.campaignConversions,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartContainer title="Campaign ROAS Comparison" subtitle="Return on ad spend by campaign">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={campaignComparison} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis
              dataKey="name"
              tick={CHART_AXIS_TICK_SM}
              axisLine={{ stroke: CHART_COLORS.border }}
              tickLine={false}
            />
            <YAxis tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`${v}x`, "ROAS"]} />
            <Bar dataKey="roas" name="ROAS" radius={[4, 4, 0, 0]}>
              {campaignComparison.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Campaign Conversions Trend" subtitle="Monthly campaign-driven conversions">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={conversionTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={CHART_AXIS_TICK_SM}
              axisLine={{ stroke: CHART_COLORS.border }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatNumber(v, true)}
              tick={CHART_AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(v) => [formatNumber(Number(v ?? 0)), "Conversions"]}
            />
            <Bar dataKey="conversions" name="Conversions" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer
        title="Spend vs Conversions"
        subtitle="Campaign efficiency scatter"
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={campaignComparison} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis
              dataKey="name"
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
              tickFormatter={(v) => formatNumber(v, true)}
              tick={CHART_AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar yAxisId="left" dataKey="spend" name="Spend (IDR)" fill="#FF6B00" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="conversions" name="Conversions" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
