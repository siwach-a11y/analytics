"use client";

import { useMemo, useState } from "react";
import { Loader2, Plug, Radio, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useApiPlugin } from "@/components/providers/api-plugin-provider";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { apiPluginApi } from "@/lib/api";
import { finalizeApiResult } from "@/lib/upload-translate";
import {
  API_PLUGIN_DEFINITIONS,
  DATA_FEED_CATEGORIES,
  getFeedsByCategory,
} from "@/lib/api-plugin/registry";
import {
  defaultFeedName,
  INTERNAL_FEED_ROUTES,
} from "@/lib/api-plugin/data-feeds";
import {
  BNII_METRICS_CATALOG_URL,
  BNII_METRICS_DICTIONARY_URL,
} from "@/lib/api-plugin/bnii-api";
import { isBniiDataFeedWorkspace } from "@/lib/bnii/raw-data-countries";
import type { ApiPluginId } from "@/lib/api-plugin";

type ApiPluginPanelProps = {
  onConnected?: () => void;
  compact?: boolean;
};

export function ApiPluginPanel({ onConnected, compact }: ApiPluginPanelProps) {
  const { workspaceId, workspace } = useWorkspace();
  const ws = workspace.workspace;
  const { addResult, results, clearResults } = useApiPlugin();
  const [pluginId, setPluginId] = useState<ApiPluginId>("workspace");
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("/api/customer-analytics");
  const [authToken, setAuthToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const definition = API_PLUGIN_DEFINITIONS.find((p) => p.id === pluginId);
  const builtinFeeds = useMemo(() => getFeedsByCategory("builtin"), []);
  const bniiFeeds = useMemo(() => getFeedsByCategory("bnii"), []);
  const telecomFeeds = useMemo(() => getFeedsByCategory("telecom"), []);
  const bniiFeedsAvailable = isBniiDataFeedWorkspace(workspaceId);

  async function connectFeed(id: ApiPluginId, feedEndpoint?: string) {
    setPluginId(id);
    setError(null);
    setLoading(true);
    try {
      const headers =
        id === "rest-json" && authToken.trim()
          ? { Authorization: `Bearer ${authToken.trim()}` }
          : undefined;

      const raw = await apiPluginApi.fetch({
        pluginId: id,
        name: name.trim() || defaultFeedName(id, ws.code),
        endpoint: feedEndpoint ?? (id === "internal-api" ? endpoint : undefined),
        workspaceId,
        headers,
      });
      addResult(finalizeApiResult(raw, workspaceId));
      onConnected?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Feed connection failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    await connectFeed(pluginId, definition?.requiresEndpoint ? endpoint : undefined);
    if (pluginId === "rest-json" || pluginId === "csv-url") {
      setEndpoint("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-muted/20 p-3">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Radio className="h-3.5 w-3.5 text-primary" />
          Data feeds · {ws.code} workspace
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Connect built-in analytics feeds or external JSON/CSV endpoints. All feeds run through the
          analytics pipeline on Home.
        </p>
      </div>

      {!compact && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Quick connect
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {builtinFeeds.map((feed) => (
              <Button
                key={feed.id}
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-[10px]"
                disabled={loading}
                onClick={() => connectFeed(feed.id)}
              >
                {feed.name}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            BNII Analytics API
          </p>
          {!bniiFeedsAvailable ? (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Thailand (U3) is not on the BNII API. Switch to a BNII workspace to connect catalog
              or dictionary feeds.
            </p>
          ) : (
            <>
              <div className="mt-2 flex flex-wrap gap-2">
                {bniiFeeds.map((feed) => (
                  <Button
                    key={feed.id}
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 text-[10px]"
                    disabled={loading}
                    onClick={() => connectFeed(feed.id)}
                  >
                    {feed.name}
                  </Button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Live from{" "}
                <span className="font-mono">
                  {BNII_METRICS_CATALOG_URL.replace(/^https:\/\//, "")}
                </span>
                {" · "}
                <span className="font-mono">
                  {BNII_METRICS_DICTIONARY_URL.replace(/^https:\/\//, "")}
                </span>
              </p>
            </>
          )}
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Telecommunications
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {telecomFeeds.map((feed) => (
              <Button
                key={feed.id}
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-[10px]"
                disabled={loading}
                onClick={() => connectFeed(feed.id)}
              >
                {feed.name}
              </Button>
            ))}
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Thailand U3 telemetry — separate from BNII Analytics API feeds.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Feed type
          </label>
          <Select value={pluginId} onValueChange={(v) => setPluginId(v as ApiPluginId)}>
            <SelectTrigger className="mt-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATA_FEED_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <p className="px-2 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    {cat.label}
                  </p>
                  {getFeedsByCategory(cat.id).map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          {definition && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-[10px] text-muted-foreground">{definition.description}</p>
              {definition.refreshHint && (
                <Badge variant="outline" className="text-[9px]">
                  {definition.refreshHint}
                </Badge>
              )}
            </div>
          )}
        </div>

        {!compact && (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Display name (optional)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultFeedName(pluginId, ws.code)}
              className="mt-1 h-8 text-xs"
            />
          </div>
        )}

        {definition?.requiresEndpoint && pluginId === "internal-api" && (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Internal route
            </label>
            <Select value={endpoint} onValueChange={setEndpoint}>
              <SelectTrigger className="mt-1 h-8 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERNAL_FEED_ROUTES.map((route) => (
                  <SelectItem key={route} value={route} className="font-mono text-xs">
                    {route}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {definition?.requiresEndpoint && pluginId !== "internal-api" && (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Endpoint URL
            </label>
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder={definition.endpointPlaceholder}
              className="mt-1 h-8 text-xs font-mono"
            />
            {definition.docsHint && (
              <p className="mt-1 text-[10px] text-muted-foreground">{definition.docsHint}</p>
            )}
          </div>
        )}

        {pluginId === "rest-json" && (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Bearer token (optional)
            </label>
            <Input
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="sk-..."
              type="password"
              className="mt-1 h-8 text-xs font-mono"
            />
          </div>
        )}

        <Button
          type="button"
          className="w-full gap-2"
          size={compact ? "sm" : "default"}
          disabled={loading}
          onClick={handleConnect}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plug className="h-4 w-4" />
          )}
          Connect feed
        </Button>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {results.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">{results.length} feed(s) connected</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-[10px]"
              onClick={clearResults}
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
