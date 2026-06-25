"use client";

import { useMemo, useState } from "react";
import { AppLink } from "@/components/app-link";
import { Header } from "@/components/layout/header";
import { MarketingAnalyticsKpi } from "@/components/marketing/marketing-analytics-kpi";
import { BehavioralTrackingCharts } from "@/components/marketing/behavioral-tracking-charts";
import { BehaviorCampaignAnalysis } from "@/components/marketing/behavior-campaign-analysis";
import { CampaignPerformanceCharts } from "@/components/marketing/campaign-performance-charts";
import { BehaviorEventFeed } from "@/components/marketing/behavior-event-feed";
import { BehaviorProfilesTable } from "@/components/marketing/behavior-profiles-table";
import { CampaignsTable } from "@/components/marketing/campaigns-table";
import { MarketingPlanPanel } from "@/components/marketing/marketing-plan-panel";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCustomerAnalytics } from "@/data/customer-analytics";
import { getBehaviorCampaignAnalytics } from "@/data/behavior-campaign-analytics";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import type { CampaignAnalysisPeriod } from "@/types";

export default function MarketingPage() {
  const { workspaceId, workspace } = useWorkspace();
  const [campaignPeriod, setCampaignPeriod] = useState<CampaignAnalysisPeriod>("monthly");

  const data = useMemo(() => getMarketingAnalytics(workspaceId), [workspaceId]);
  const behaviorCampaignData = useMemo(
    () => getBehaviorCampaignAnalytics(workspaceId, campaignPeriod),
    [workspaceId, campaignPeriod]
  );
  const customers = useMemo(
    () => getCustomerAnalytics(workspaceId).customers,
    [workspaceId]
  );
  const ws = workspace.workspace;

  return (
    <>
      <Header
        title="Engagement Intelligence"
        subtitle={`${ws.name} ${ws.country} · STW, Quest, and Screen Time campaigns`}
      />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex justify-end">
          <AppLink href="/customers" className="text-xs text-primary hover:underline">
            ← Subscriber Analytics
          </AppLink>
        </div>

        <MarketingAnalyticsKpi
          eventsTracked30d={data.eventsTracked30d}
          avgEngagementScore={data.avgEngagementScore}
          activeCampaigns={data.activeCampaigns}
          avgCampaignRoas={data.avgCampaignRoas}
          campaignConversionRate={data.campaignConversionRate}
          eventsChange={data.eventsChange}
          engagementChange={data.engagementChange}
          roasChange={data.roasChange}
        />

        <Tabs defaultValue="periods">
          <TabsList>
            <TabsTrigger value="periods">Campaign periods</TabsTrigger>
            <TabsTrigger value="behavior">Behavior tracking</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign analysis</TabsTrigger>
            <TabsTrigger value="plan">Marketing plan</TabsTrigger>
          </TabsList>

          <TabsContent value="periods" className="mt-4 space-y-6">
            <BehaviorCampaignAnalysis
              data={behaviorCampaignData}
              period={campaignPeriod}
              onPeriodChange={setCampaignPeriod}
            />
          </TabsContent>

          <TabsContent value="behavior" className="mt-4 space-y-6">
            <BehavioralTrackingCharts
              engagementTimeSeries={data.engagementTimeSeries}
              eventsByType={data.eventsByType}
              behavioralSegmentBreakdown={data.behavioralSegmentBreakdown}
              journeyStages={data.journeyStages}
              channelEffectiveness={data.channelEffectiveness}
            />
            <BehaviorEventFeed events={data.recentEvents} customers={customers} />
            <BehaviorProfilesTable profiles={data.behaviorProfiles} customers={customers} />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4 space-y-6">
            <CampaignPerformanceCharts
              campaignComparison={data.campaignComparison}
              engagementTimeSeries={data.engagementTimeSeries}
            />
            <CampaignsTable campaigns={data.campaigns} />
          </TabsContent>

          <TabsContent value="plan" className="mt-4 space-y-6">
            <MarketingPlanPanel recommendations={data.recommendations} />
            <CampaignsTable campaigns={data.campaigns.filter((c) => c.status === "active")} />
          </TabsContent>
        </Tabs>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-primary">{ws.code} Engagement Model</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Subscriber actions — STW spins, quest completions, screen-time sessions, access-pass
            burns — are scored into behavioral segments. Use <strong>Campaign periods</strong> for
            monthly, quarterly, and yearly behavioral campaign analysis. Metrics align with{" "}
            {ws.code} workspace totals.
          </p>
        </div>
      </div>
    </>
  );
}
