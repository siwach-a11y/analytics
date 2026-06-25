"use client";

import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserMinus,
  Heart,
  DollarSign,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatPercent, cnChangeColor } from "@/lib/formatters";

interface CustomerKpiProps {
  label: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "danger";
}

function CustomerKpi({
  label,
  value,
  change,
  subtitle,
  icon,
  variant = "default",
}: CustomerKpiProps) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className="text-muted-foreground/60">{icon}</div>
      </div>
      <p
        className={cn(
          "mt-2 font-mono text-2xl font-bold tracking-tight lg:text-3xl",
          variant === "warning" && "text-amber-400",
          variant === "danger" && "text-red-400"
        )}
      >
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

interface CustomerAnalyticsKpiProps {
  totalCustomers: number;
  activeCustomers: number;
  atRiskCustomers: number;
  newCustomersThisMonth: number;
  retentionRate: number;
  churnRate: number;
  avgLtv: number;
  npsScore: number;
  totalCustomerChange: number;
  retentionChange: number;
  npsChange: number;
}

export function CustomerAnalyticsKpi({
  totalCustomers,
  activeCustomers,
  atRiskCustomers,
  newCustomersThisMonth,
  retentionRate,
  churnRate,
  avgLtv,
  npsScore,
  totalCustomerChange,
  retentionChange,
  npsChange,
}: CustomerAnalyticsKpiProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
      <CustomerKpi
        label="Subscribers"
        value={formatNumber(totalCustomers, true)}
        change={totalCustomerChange}
        icon={<Users className="h-4 w-4" />}
      />
      <CustomerKpi
        label="MAU"
        value={formatNumber(activeCustomers, true)}
        subtitle={`${retentionRate.toFixed(1)}% stickiness`}
        icon={<UserCheck className="h-4 w-4" />}
      />
      <CustomerKpi
        label="At Risk"
        value={String(atRiskCustomers)}
        subtitle="Sample cohort flagged"
        variant="warning"
        icon={<UserMinus className="h-4 w-4" />}
      />
      <CustomerKpi
        label="STW Winners (30d)"
        value={formatNumber(newCustomersThisMonth, true)}
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <CustomerKpi
        label="DAU / MAU"
        value={`${retentionRate.toFixed(1)}%`}
        change={retentionChange}
        icon={<Heart className="h-4 w-4" />}
      />
      <CustomerKpi
        label="Burn Rate"
        value={`${churnRate.toFixed(2)}%`}
        variant={churnRate > 15 ? "warning" : "default"}
        icon={<UserMinus className="h-4 w-4" />}
      />
      <CustomerKpi
        label="Net BNRY / User"
        value={String((avgLtv / 1000).toFixed(1))}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <CustomerKpi
        label="NPS Score"
        value={String(npsScore)}
        change={npsChange}
        icon={<Star className="h-4 w-4" />}
      />
    </div>
  );
}
