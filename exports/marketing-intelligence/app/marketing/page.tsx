"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { MarketingAnalyticsKpi } from "@/components/marketing/marketing-analytics-kpi";
import { BehavioralTrackingCharts } from "@/components/marketing/behavioral-tracking-charts";
import { CampaignPerformanceCharts } from "@/components/marketing/campaign-performance-charts";
import { BehaviorEventFeed } from "@/components/marketing/behavior-event-feed";
import { BehaviorProfilesTable } from "@/components/marketing/behavior-profiles-table";
import { CampaignsTable } from "@/components/marketing/campaigns-table";
import { MarketingPlanPanel } from "@/components/marketing/marketing-plan-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMarketingAnalytics } from "@/data/marketing-analytics";
import { getUnacknowledgedAlertCount } from "@/lib/alerts";

const data = getMarketingAnalytics();

export default function MarketingPage() {
  return (
    <>
      <Header
        title="Marketing Intelligence"
        subtitle="Track customer behavior, analyze campaign performance, and plan targeted outreach"
        alertCount={getUnacknowledgedAlertCount()}
      />
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex justify-end">
          <Link href="/customers" className="text-xs text-primary hover:underline">
            ← Customer Analytics
          </Link>
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

        <Tabs defaultValue="behavior">
          <TabsList>
            <TabsTrigger value="behavior">Behavior Tracking</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Analysis</TabsTrigger>
            <TabsTrigger value="plan">Marketing Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="behavior" className="mt-4 space-y-6">
            <BehavioralTrackingCharts
              engagementTimeSeries={data.engagementTimeSeries}
              eventsByType={data.eventsByType}
              behavioralSegmentBreakdown={data.behavioralSegmentBreakdown}
              journeyStages={data.journeyStages}
              channelEffectiveness={data.channelEffectiveness}
            />
            <BehaviorEventFeed events={data.recentEvents} />
            <BehaviorProfilesTable profiles={data.behaviorProfiles} />
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
          <p className="text-sm font-semibold text-primary">How Behavioral Marketing Works</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Every customer action — app opens, payments, promo clicks, campaign conversions — is
            tracked and scored into behavioral segments. Campaigns are triggered by these signals
            (e.g. dormant 14 days, DeFi browse pattern). The marketing plan recommends campaigns
            based on segment behavior, channel preference, and expected lift. All data is mock for
            demonstration purposes.
          </p>
        </div>
      </div>
    </>
  );
}
