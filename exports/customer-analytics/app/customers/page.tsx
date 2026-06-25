"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { CustomerAnalyticsKpi } from "@/components/analytics/customer-analytics-kpi";
import { CustomerTrackingCharts } from "@/components/analytics/customer-tracking-charts";
import { CustomersTable } from "@/components/analytics/customers-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getUnacknowledgedAlertCount } from "@/lib/alerts";

const data = getCustomerAnalytics();

export default function CustomersPage() {
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");

  const filteredCustomers = useMemo(() => {
    if (lifecycleFilter === "all") return data.customers;
    return data.customers.filter((c) => c.lifecycleStage === lifecycleFilter);
  }, [lifecycleFilter]);

  return (
    <>
      <Header
        title="Customer Analytics"
        subtitle="Lifecycle, retention, LTV, and acquisition insights across the telecom DApp ecosystem"
        alertCount={getUnacknowledgedAlertCount()}
      />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex justify-end">
          <Link href="/marketing" className="text-xs text-primary hover:underline">
            Marketing Intelligence →
          </Link>
        </div>

        <CustomerAnalyticsKpi
          totalCustomers={data.totalCustomers}
          activeCustomers={data.activeCustomers}
          atRiskCustomers={data.atRiskCustomers}
          newCustomersThisMonth={data.newCustomersThisMonth}
          retentionRate={data.retentionRate}
          churnRate={data.churnRate}
          avgLtv={data.avgLtv}
          npsScore={data.npsScore}
          totalCustomerChange={data.totalCustomerChange}
          retentionChange={data.retentionChange}
          npsChange={data.npsChange}
        />

        <CustomerTrackingCharts
          timeSeries={data.timeSeries}
          byLifecycle={data.byLifecycle}
          bySegment={data.bySegment}
          byChannel={data.byChannel}
          byOperator={data.byOperator}
          acquisitionFunnel={data.acquisitionFunnel}
          cohortRetention={data.cohortRetention}
        />

        <Tabs value={lifecycleFilter} onValueChange={setLifecycleFilter}>
          <TabsList>
            <TabsTrigger value="all">
              All Customers ({data.customers.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({data.byLifecycle.find((l) => l.stage === "active")?.count ?? 0})
            </TabsTrigger>
            <TabsTrigger value="at_risk">
              At Risk ({data.atRiskCustomers})
            </TabsTrigger>
            <TabsTrigger value="churned">
              Churned ({data.churnedCustomers})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <CustomersTable customers={filteredCustomers} />
          </div>
        </Tabs>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-primary">Customer Intelligence</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Customer analytics tracks end-user lifecycle from acquisition through retention and
            churn. Cohort retention shows how signup groups retain over time. LTV and NPS metrics
            are computed from sample customer records; ecosystem totals reflect operator-scale
            aggregates. All data is mock for demonstration purposes.
          </p>
        </div>
      </div>
    </>
  );
}
