"use client";

import {
  ComposedChart,
  Area,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
} from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";
import { formatNumber } from "@/lib/formatters";
import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  CHART_AXIS_TICK,
  CHART_AXIS_TICK_SM,
} from "@/lib/chart-theme";
import type { MarketingAnalyticsSummary } from "@/types";

const SEGMENT_COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];
const EVENT_COLORS = ["#FF6B00", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#0066CC", "#EC4899", "#6366F1"];

interface BehavioralTrackingChartsProps {
  engagementTimeSeries: MarketingAnalyticsSummary["engagementTimeSeries"];
  eventsByType: MarketingAnalyticsSummary["eventsByType"];
  behavioralSegmentBreakdown: MarketingAnalyticsSummary["behavioralSegmentBreakdown"];
  journeyStages: MarketingAnalyticsSummary["journeyStages"];
  channelEffectiveness: MarketingAnalyticsSummary["channelEffectiveness"];
}

function formatSegmentLabel(segment: string): string {
  return segment.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatEventType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function BehavioralTrackingCharts({
  engagementTimeSeries,
  eventsByType,
  behavioralSegmentBreakdown,
  journeyStages,
  channelEffectiveness,
}: BehavioralTrackingChartsProps) {
  const segmentData = behavioralSegmentBreakdown.map((s) => ({
    name: formatSegmentLabel(s.segment),
    count: s.count,
    engagement: s.avgEngagement,
  }));

  const eventData = eventsByType.map((e) => ({
    name: formatEventType(e.type),
    count: e.count,
  }));

  const journeyData = journeyStages.map((j) => ({
    name: j.stage,
    count: j.count,
    rate: j.rate,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartContainer
        title="Engagement & Events Trend"
        subtitle="Behavioral events and engagement score over time"
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={engagementTimeSeries} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-events" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={CHART_AXIS_TICK}
              axisLine={{ stroke: CHART_COLORS.border }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => formatNumber(v, true)}
              tick={CHART_AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${v}`}
              tick={CHART_AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="events"
              name="Behavior Events"
              stroke="#FF6B00"
              fill="url(#grad-events)"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="engagementScore"
              name="Engagement Score"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Behavioral Segments" subtitle="Customer cohorts by activity pattern">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={segmentData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="count"
              nameKey="name"
            >
              {segmentData.map((_, i) => (
                <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Segment Engagement" subtitle="Avg engagement score by behavioral segment">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={segmentData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis
              dataKey="name"
              tick={CHART_AXIS_TICK_SM}
              axisLine={{ stroke: CHART_COLORS.border }}
              tickLine={false}
            />
            <YAxis tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Bar dataKey="engagement" name="Engagement Score" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Event Types" subtitle="Behavioral actions tracked (sample feed)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={eventData} layout="vertical" margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis type="number" tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={CHART_AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {eventData.map((_, i) => (
                <Cell key={i} fill={EVENT_COLORS[i % EVENT_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Customer Journey" subtitle="Behavioral funnel from awareness to loyalty">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={journeyData}
            layout="vertical"
            margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis
              type="number"
              tickFormatter={(v) => formatNumber(v, true)}
              tick={CHART_AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={CHART_AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value, _name, item) => [
                `${formatNumber(Number(value ?? 0), true)} (${item.payload.rate}%)`,
                "Users",
              ]}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Channel Effectiveness" subtitle="Open rate vs conversion by outreach channel">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={channelEffectiveness} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
            <Line type="monotone" dataKey="openRate" name="Open Rate" stroke="#FF6B00" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="conversionRate" name="Conversion Rate" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
