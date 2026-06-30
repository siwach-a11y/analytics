import type { ApiPluginDefinition, ApiPluginId, DataFeedCategory } from "./types";

export const DATA_FEED_CATEGORIES: { id: DataFeedCategory; label: string }[] = [
  { id: "builtin", label: "Built-in analytics feeds" },
  { id: "external", label: "External data feeds" },
];

export const API_PLUGIN_DEFINITIONS: ApiPluginDefinition[] = [
  {
    id: "workspace",
    name: "Workspace KPIs",
    description: "Live DAU, MAU, BNRY earn/burn, and campaign counts for the selected workspace.",
    category: "builtin",
    requiresEndpoint: false,
    refreshHint: "Real-time · workspace scoped",
    docsHint: "Uses the country selector in the header.",
  },
  {
    id: "customer-analytics",
    name: "Subscriber Analytics Feed",
    description: "Lifecycle mix, segments, operators, and acquisition funnel metrics.",
    category: "builtin",
    requiresEndpoint: false,
    refreshHint: "Synced with /customers",
  },
  {
    id: "marketing-analytics",
    name: "Engagement & Campaign Feed",
    description: "Campaign ROAS, engagement scores, event volumes, and behavioral segments.",
    category: "builtin",
    requiresEndpoint: false,
    refreshHint: "Synced with /marketing",
  },
  {
    id: "customer-intelligence",
    name: "Customer 360 & RFM Feed",
    description: "RFM segments, cohort sizes, and Customer 360 KPIs as a tabular feed.",
    category: "builtin",
    requiresEndpoint: false,
    refreshHint: "Customer 360 · RFM · Cohorts",
  },
  {
    id: "internal-api",
    name: "Internal API Route",
    description: "Pull JSON from this app's analytics API routes (e.g. /api/customer-analytics).",
    category: "external",
    requiresEndpoint: true,
    endpointPlaceholder: "/api/customer-analytics",
    refreshHint: "Same-origin API",
    docsHint: "Path only or full URL. Works with all GET analytics routes.",
  },
  {
    id: "rest-json",
    name: "REST JSON Feed",
    description: "Connect any external GET JSON endpoint — arrays or { data: [...] } payloads.",
    category: "external",
    requiresEndpoint: true,
    endpointPlaceholder: "https://api.example.com/metrics",
    refreshHint: "External · poll on connect",
    docsHint: "Optional Bearer token below. Response must be JSON.",
  },
  {
    id: "csv-url",
    name: "CSV URL Feed",
    description: "Import comma-separated data from a public CSV URL.",
    category: "external",
    requiresEndpoint: true,
    endpointPlaceholder: "https://example.com/data.csv",
    refreshHint: "External · CSV",
    docsHint: "First row must be column headers.",
  },
];

export function getPluginDefinition(id: string): ApiPluginDefinition | undefined {
  return API_PLUGIN_DEFINITIONS.find((p) => p.id === id);
}

export function getFeedsByCategory(category: DataFeedCategory): ApiPluginDefinition[] {
  return API_PLUGIN_DEFINITIONS.filter((p) => p.category === category);
}

export function getBuiltinFeedIds(): ApiPluginId[] {
  return API_PLUGIN_DEFINITIONS.filter((p) => p.category === "builtin").map((p) => p.id);
}
