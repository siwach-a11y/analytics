"use client";

import { useMemo } from "react";
import { AppLink } from "@/components/app-link";
import { Header } from "@/components/layout/header";
import { CustomerAnalyticsKpi } from "@/components/analytics/customer-analytics-kpi";
import { CustomerTrackingCharts } from "@/components/analytics/customer-tracking-charts";
import { CustomersTable } from "@/components/analytics/customers-table";
import { Customer360Panel } from "@/components/analytics/customer-360-panel";
import { RfmAnalysisPanel } from "@/components/analytics/rfm-analysis-panel";
import { CohortAnalysisPanel } from "@/components/analytics/cohort-analysis-panel";
import { ClusterSegmentationPanel } from "@/components/workspace/cluster-segmentation-panel";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getCustomerIntelligence } from "@/data/customer-intelligence";

export default function CustomersPage() {
  const { workspaceId, workspace } = useWorkspace();
  const data = useMemo(() => getCustomerAnalytics(workspaceId), [workspaceId]);
  const intelligence = useMemo(() => getCustomerIntelligence(workspaceId), [workspaceId]);

  const ws = workspace.workspace;

  return (
    <>
      <Header
        title="Subscriber Analytics"
        subtitle={`${ws.name} ${ws.country} · Customer 360, RFM, cohorts & segmentation`}
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

        <Tabs defaultValue="customer360">
          <TabsList className="flex h-auto flex-wrap gap-1">
            <TabsTrigger value="customer360">Customer 360</TabsTrigger>
            <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
            <TabsTrigger value="rfm">RFM</TabsTrigger>
            <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="customer360" className="mt-4">
            <Customer360Panel data={intelligence.customer360} />
          </TabsContent>

          <TabsContent value="segmentation" className="mt-4">
            <ClusterSegmentationPanel workspaceId={workspaceId} />
          </TabsContent>

          <TabsContent value="rfm" className="mt-4">
            <RfmAnalysisPanel data={intelligence.rfm} />
          </TabsContent>

          <TabsContent value="cohort" className="mt-4">
            <CohortAnalysisPanel data={intelligence.cohort} />
          </TabsContent>

          <TabsContent value="overview" className="mt-4 space-y-6">
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
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Sample Subscribers</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Representative {ws.country} earn-channel cohorts
                </p>
              </div>
              <CustomersTable customers={data.customers} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
