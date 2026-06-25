# Analytics Feature — ADD Guide

Copy bundle for **analytics functions and API routes** (U9 Myanmar / BNII demo data).

Use this when you already have subscriber + engagement pages, or want API-only analytics without copying full UI bundles.

## What this adds

| File | Purpose |
|------|---------|
| `lib/analytics.ts` | Server functions: `getAnalyticsOverview()`, `getSubscriberAnalytics()`, `getEngagementAnalytics()`, `getWorkspaceAnalytics()` |
| `lib/api.ts` | Client fetch helpers: `analyticsApi.overview()`, `.subscribers()`, `.engagement()`, `.workspace()` |
| `app/api/analytics/overview/route.ts` | `GET /api/analytics/overview` — combined payload |
| `app/api/u9-analytics/route.ts` | `GET /api/u9-analytics` — workspace dashboard JSON |
| `app/api/customer-analytics/route.ts` | `GET /api/customer-analytics` (thin wrapper) |
| `app/api/marketing-analytics/route.ts` | `GET /api/marketing-analytics` (thin wrapper) |

## Prerequisites

This bundle **does not** include data layers or UI. You need:

1. **Data** (from `analytics-dashboard/src/data/` or export bundles):
   - `u9-constants.ts`, `u9-analytics.ts`
   - `customer-analytics.ts`, `marketing-analytics.ts`
   - `telecom-operators.json`, `index.ts`

2. **Types** — `src/types/index.ts` (or merge `exports/customer-analytics/types` + `exports/marketing-intelligence/types`)

3. **Optional UI** — copy `exports/customer-analytics` and `exports/marketing-intelligence` for full pages

## Quick copy

```bash
# From agenthub root
npm run exports:copy:analytics

# Custom target
EXPORT_TARGET=your-project/src npm run exports:copy:analytics
```

Or manually:

```bash
cp exports/analytics-feature/lib/*.ts your-project/src/lib/
cp -R exports/analytics-feature/app/api your-project/src/app/
```

## Server usage

```ts
import { analytics, getAnalyticsOverview } from "@/lib/analytics";

// Combined U9 overview
const overview = getAnalyticsOverview();

// Named accessors
const subscribers = analytics.subscribers();
const engagement = analytics.engagement();
const workspace = analytics.workspace();
```

## Client usage

```ts
import { analyticsApi } from "@/lib/api";

const overview = await analyticsApi.overview();
const u9 = await analyticsApi.workspace();
```

## API routes

| Route | Returns |
|-------|---------|
| `GET /api/analytics/overview` | `{ workspace, customer, marketing, u9, generatedAt }` |
| `GET /api/customer-analytics` | Subscriber analytics summary |
| `GET /api/marketing-analytics` | Engagement / campaign summary |
| `GET /api/u9-analytics` | U9 workspace dashboard payload |

## Sidebar entries (full dashboard)

```tsx
{ href: "/", label: "Overview", icon: LayoutDashboard },
{ href: "/workspace/u9", label: "U9 · Myanmar", icon: Globe2 },
{ href: "/customers", label: "Subscribers", icon: Users },
{ href: "/marketing", label: "Engagement", icon: Megaphone },
```

## Full dashboard

Ready-to-run app: [`analytics-dashboard/`](../../analytics-dashboard/) — `npm run analytics:dev` (port 3002).

Static HTML demo: `npm run analytics:demo` → `analytics-dashboard-demo/`

**Add Files UI:** In the live dashboard, use the header **Add Files** button to copy npm commands, download the ADD guide, or download export zips.
