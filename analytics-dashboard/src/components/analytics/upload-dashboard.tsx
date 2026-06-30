"use client";

import { AnalyticsViewCard } from "@/components/analytics/analytics-view-card";
import { useUploadAnalytics } from "@/components/providers/upload-analytics-provider";
import { useApiPlugin } from "@/components/providers/api-plugin-provider";
import { UPLOAD_TYPE_LABELS } from "@/lib/upload-analytics";
import { pluginBadgeLabel } from "@/lib/api-plugin/data-feeds";

export function ImportedAnalyticsDashboard() {
  const { uploads, removeUpload } = useUploadAnalytics();
  const { results, removeResult } = useApiPlugin();

  const total = uploads.length + results.length;
  if (total === 0) return null;

  return (
    <section id="imported-data" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Analytics from your data</h2>
        <p className="text-sm text-muted-foreground">
          Uploads and data feeds are translated into KPIs, trends, and breakdowns — not shown as raw
          sources
        </p>
      </div>
      <div className="space-y-4">
        {uploads.map((upload) => (
          <AnalyticsViewCard
            key={upload.id}
            id={upload.id}
            name={upload.name}
            domainLabel={upload.analytics.domainLabel}
            sourceBadge={UPLOAD_TYPE_LABELS[upload.sourceType]}
            analytics={upload.analytics}
            imagePreviewUrl={upload.imagePreviewUrl}
            onRemove={() => removeUpload(upload.id)}
          />
        ))}
        {results.map((result) => (
          <AnalyticsViewCard
            key={result.connectionId}
            id={result.connectionId}
            name={result.name}
            domainLabel={result.analytics.domainLabel}
            sourceBadge={pluginBadgeLabel(result.pluginId)}
            analytics={result.analytics}
            apiEndpoint={result.endpoint}
            onRemove={() => removeResult(result.connectionId)}
          />
        ))}
      </div>
    </section>
  );
}

/** @deprecated Use ImportedAnalyticsDashboard */
export function UploadDashboard() {
  return <ImportedAnalyticsDashboard />;
}
