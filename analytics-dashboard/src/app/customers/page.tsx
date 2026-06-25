"use client";

import { useState, useMemo } from "react";
import { AppLink } from "@/components/app-link";
import { Header } from "@/components/layout/header";
import { CustomerAnalyticsKpi } from "@/components/analytics/customer-analytics-kpi";
import { CustomerTrackingCharts } from "@/components/analytics/customer-tracking-charts";
import { CustomersTable } from "@/components/analytics/customers-table";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCustomerAnalytics } from "@/data/customer-analytics";

export default function CustomersPage() {
  const { workspaceId, workspace } = useWorkspace();
  const data = useMemo(() => getCustomerAnalytics(workspaceId), [workspaceId]);
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");

  const filteredCustomers = useMemo(() => {
    if (lifecycleFilter === "all") return data.customers;
    return data.customers.filter((c) => c.lifecycleStage === lifecycleFilter);
  }, [lifecycleFilter, data.customers]);

  const ws = workspace.workspace;

  return (
    <>
      <Header
        title="Subscriber Analytics"
        subtitle={`${ws.name} ${ws.country} · BNII pilot workspace`}
      />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex justify-end">
          <AppLink href="/marketing" className="text-xs text-primary hover:underline">
            Engagement Intelligence →
          </AppLink>
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

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Sample Subscribers</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Representative {ws.country} earn-channel cohorts
              </p>
            </div>
            <Tabs value={lifecycleFilter} onValueChange={setLifecycleFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="at_risk">At Risk</TabsTrigger>
                <TabsTrigger value="churned">Churned</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CustomersTable customers={filteredCustomers} />
        </div>
      </div>
    </>
  );
}
