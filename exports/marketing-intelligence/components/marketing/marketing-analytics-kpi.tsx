"use client";

import {
  TrendingUp,
  TrendingDown,
  Activity,
  Megaphone,
  Target,
  MousePointerClick,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent, cnChangeColor } from "@/lib/formatters";

interface MarketingKpiProps {
  label: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: React.ReactNode;
}

function MarketingKpi({ label, value, change, subtitle, icon }: MarketingKpiProps) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className="text-muted-foreground/60">{icon}</div>
      </div>
      <p className="mt-2 font-mono text-2xl font-bold tracking-tight lg:text-3xl">
        {value}
      </p>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {change >= 0 ? (
            <TrendingUp className={cn("h-3 w-3", cnChangeColor(change))} />
          ) : (
            <TrendingDown className={cn("h-3 w-3", cnChangeColor(change))} />
          )}
          <span className={cn("font-mono text-xs", cnChangeColor(change))}>
            {formatPercent(change)}
          </span>
          <span className="text-[10px] text-muted-foreground">vs last month</span>
        </div>
      )}
      {subtitle && (
        <p className="mt-1 text-[10px] text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

interface MarketingAnalyticsKpiProps {
  eventsTracked30d: number;
  avgEngagementScore: number;
  activeCampaigns: number;
  avgCampaignRoas: number;
  campaignConversionRate: number;
  eventsChange: number;
  engagementChange: number;
  roasChange: number;
}

export function MarketingAnalyticsKpi({
  eventsTracked30d,
  avgEngagementScore,
  activeCampaigns,
  avgCampaignRoas,
  campaignConversionRate,
  eventsChange,
  engagementChange,
  roasChange,
}: MarketingAnalyticsKpiProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <MarketingKpi
        label="Behavior Events (30d)"
        value={formatNumber(eventsTracked30d, true)}
        change={eventsChange}
        icon={<Activity className="h-4 w-4" />}
      />
      <MarketingKpi
        label="Avg Engagement"
        value={`${avgEngagementScore}/100`}
        change={engagementChange}
        icon={<BarChart2 className="h-4 w-4" />}
      />
      <MarketingKpi
        label="Active Campaigns"
        value={String(activeCampaigns)}
        subtitle="Running now"
        icon={<Megaphone className="h-4 w-4" />}
      />
      <MarketingKpi
        label="Campaign ROAS"
        value={`${avgCampaignRoas.toFixed(1)}x`}
        change={roasChange}
        icon={<Target className="h-4 w-4" />}
      />
      <MarketingKpi
        label="Campaign CVR"
        value={`${campaignConversionRate.toFixed(1)}%`}
        subtitle="Click to conversion"
        icon={<MousePointerClick className="h-4 w-4" />}
      />
      <MarketingKpi
        label="Behavior Segments"
        value="5"
        subtitle="Tracked cohorts"
        icon={<Activity className="h-4 w-4" />}
      />
    </div>
  );
}
