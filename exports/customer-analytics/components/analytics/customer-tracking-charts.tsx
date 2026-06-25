"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer } from "@/components/charts/chart-container";
import { formatNumber } from "@/lib/formatters";
import { getOperatorName } from "@/data";
import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
  CHART_AXIS_TICK,
  CHART_AXIS_TICK_SM,
} from "@/lib/chart-theme";
import type { CustomerAnalyticsSummary } from "@/types";

const LIFECYCLE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
const SEGMENT_COLORS = ["#FF6B00", "#8B5CF6", "#0066CC", "#10B981"];
const CHANNEL_COLORS = ["#FF6B00", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"];
const OPERATOR_COLORS = { telkomsel: "#FF6B00", indosat: "#E4002B", globe: "#0066CC" };

interface CustomerTrackingChartsProps {
  timeSeries: CustomerAnalyticsSummary["timeSeries"];
  byLifecycle: CustomerAnalyticsSummary["byLifecycle"];
  bySegment: CustomerAnalyticsSummary["bySegment"];
  byChannel: CustomerAnalyticsSummary["byChannel"];
  byOperator: CustomerAnalyticsSummary["byOperator"];
  acquisitionFunnel: CustomerAnalyticsSummary["acquisitionFunnel"];
  cohortRetention: CustomerAnalyticsSummary["cohortRetention"];
}

export function CustomerTrackingCharts({
  timeSeries,
  byLifecycle,
  bySegment,
  byChannel,
  byOperator,
  acquisitionFunnel,
  cohortRetention,
}: CustomerTrackingChartsProps) {
  const lifecycleData = byLifecycle.map((l) => ({
    name: l.stage.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: l.count,
  }));

  const segmentData = bySegment.map((s) => ({
    name: s.segment.charAt(0).toUpperCase() + s.segment.slice(1),
    count: s.count,
    avgLtv: s.avgLtv,
  }));

  const channelData = byChannel.map((c) => ({
    name: c.channel.charAt(0).toUpperCase() + c.channel.slice(1),
    count: c.count,
    conversion: c.conversionRate,
  }));

  const operatorData = byOperator.map((o) => ({
    name: getOperatorName(o.operator).split(" ")[0],
    customers: o.customers,
    retention: o.retention,
    color: OPERATOR_COLORS[o.operator],
  }));

  const funnelData = acquisitionFunnel.map((f) => ({
    name: f.stage,
    value: f.count,
    rate: f.rate,
  }));

  const cohortChartData = cohortRetention.map((row) => ({
    cohort: row.cohort,
    M0: row.month0,
    M1: row.month1,
    M2: row.month2,
    M3: row.month3,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartContainer
        title="Customer Growth"
        subtitle="Total vs active customers over time"
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={timeSeries} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="grad-total-cust" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-active-cust" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
              tickFormatter={(v) => formatNumber(v, true)}
              tick={CHART_AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value) => [formatNumber(Number(value ?? 0)), ""]}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
            <Area
              type="monotone"
              dataKey="totalCustomers"
              name="Total Customers"
              stroke="#FF6B00"
              fill="url(#grad-total-cust)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="activeCustomers"
              name="Active Customers"
              stroke="#10B981"
              fill="url(#grad-active-cust)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Lifecycle Stage" subtitle="Sample customer distribution">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={lifecycleData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {lifecycleData.map((_, i) => (
                <Cell key={i} fill={LIFECYCLE_COLORS[i % LIFECYCLE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Segment LTV" subtitle="Customers and average lifetime value">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={segmentData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis
              dataKey="name"
              tick={CHART_AXIS_TICK_SM}
              axisLine={{ stroke: CHART_COLORS.border }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={CHART_AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => formatNumber(v, true)}
              tick={CHART_AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar yAxisId="left" dataKey="count" name="Customers" fill="#FF6B00" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="avgLtv" name="Avg LTV" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Acquisition Funnel" subtitle="Ecosystem conversion stages">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={funnelData}
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
              width={100}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value, _name, item) => [
                `${formatNumber(Number(value ?? 0), true)} (${item.payload.rate}%)`,
                "Count",
              ]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {funnelData.map((_, i) => (
                <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Acquisition Channels" subtitle="Sample channel mix & conversion">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={channelData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis
              dataKey="name"
              tick={CHART_AXIS_TICK_SM}
              axisLine={{ stroke: CHART_COLORS.border }}
              tickLine={false}
            />
            <YAxis tick={CHART_AXIS_TICK_SM} axisLine={false} tickLine={false} width={28} />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Bar dataKey="count" name="Customers" radius={[4, 4, 0, 0]}>
              {channelData.map((_, i) => (
                <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Customers by Operator" subtitle="Ecosystem scale & retention">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={operatorData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
              width={40}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${v}%`}
              tick={CHART_AXIS_TICK_SM}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar yAxisId="left" dataKey="customers" name="Customers" radius={[4, 4, 0, 0]}>
              {operatorData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
            <Bar yAxisId="right" dataKey="retention" name="Retention %" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer
        title="Cohort Retention"
        subtitle="Monthly retention by signup cohort (%)"
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={cohortChartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} opacity={0.5} />
            <XAxis
              dataKey="cohort"
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
            <Bar dataKey="M0" name="Month 0" fill="#FF6B00" radius={[2, 2, 0, 0]} />
            <Bar dataKey="M1" name="Month 1" fill="#F59E0B" radius={[2, 2, 0, 0]} />
            <Bar dataKey="M2" name="Month 2" fill="#10B981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="M3" name="Month 3" fill="#3B82F6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
