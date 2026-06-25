"use client";

import { ImportedAnalyticsDashboard } from "@/components/analytics/upload-dashboard";

/** API plugin views use the shared analytics pipeline — re-export unified dashboard */
export function ApiPluginDashboard() {
  return <ImportedAnalyticsDashboard />;
}
