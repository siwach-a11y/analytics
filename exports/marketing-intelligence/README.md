# Marketing Intelligence — Copy Bundle

Self-contained export from `telecom-dapp-dashboard`. Copy this folder into your Next.js project.

## File tree

```
marketing-intelligence/
├── README.md
├── types/
│   └── marketing-intelligence.ts      # All TypeScript types for this feature
├── data/
│   ├── customer-behavior-profiles.json
│   ├── customer-behavior-events.json
│   ├── marketing-campaigns.json
│   ├── marketing-engagement-series.json
│   ├── marketing-recommendations.json
│   └── marketing-analytics.ts         # getMarketingAnalytics() data accessor
├── app/
│   ├── marketing/
│   │   └── page.tsx                   # Page route → /marketing
│   └── api/
│       └── marketing-analytics/
│           └── route.ts               # GET /api/marketing-analytics
└── components/
    └── marketing/
        ├── marketing-analytics-kpi.tsx
        ├── behavioral-tracking-charts.tsx
        ├── behavior-event-feed.tsx
        ├── behavior-profiles-table.tsx
        ├── campaign-performance-charts.tsx
        ├── campaigns-table.tsx
        └── marketing-plan-panel.tsx
```

## After copying — map into your app

| Export path | Paste into your project |
|-------------|-------------------------|
| `types/marketing-intelligence.ts` | `src/types/marketing-intelligence.ts` |
| `data/*` | `src/data/` |
| `app/marketing/page.tsx` | `src/app/marketing/page.tsx` |
| `app/api/marketing-analytics/route.ts` | `src/app/api/marketing-analytics/route.ts` |
| `components/marketing/*` | `src/components/marketing/` |

## Cross-feature dependency

Marketing Intelligence links customer IDs to display names. It imports:

```ts
import { customers } from "@/data/customer-analytics";
```

**Option A:** Also copy the Customer Analytics bundle (`exports/customer-analytics/`).

**Option B:** Copy only `data/customers.json` and a minimal accessor:

```ts
// src/data/customers.ts
import customersData from "./customers.json";
import type { CustomerRef } from "@/types/marketing-intelligence";
export const customers = customersData as CustomerRef[];
```

Then update imports in:
- `components/marketing/behavior-event-feed.tsx`
- `components/marketing/behavior-profiles-table.tsx`
- `data/marketing-analytics.ts` (remove `getCustomerWithBehavior` or point at customers.ts)

## Shared dependencies (not included)

```
src/lib/formatters.ts
src/lib/chart-theme.ts
src/lib/alerts.ts
src/lib/utils.ts                 # cn()
src/components/charts/chart-container.tsx
src/components/layout/header.tsx
src/data/index.ts                # getOperatorName()
src/data/telecom-operators.json
src/components/ui/tabs.tsx
src/components/ui/badge.tsx
src/components/ui/button.tsx
src/components/ui/input.tsx
src/components/ui/select.tsx
src/components/ui/table.tsx
src/components/ui/progress.tsx
```

## Import path updates

```ts
// From:
import type { MarketingAnalyticsSummary } from "@/types";
// To:
import type { MarketingAnalyticsSummary } from "@/types/marketing-intelligence";
```

## Sidebar nav entry

```tsx
{ href: "/marketing", label: "Marketing Intel", icon: Megaphone },
```

## Route

- Page: `http://localhost:3001/marketing`
- API: `GET /api/marketing-analytics`

## Page tabs

1. **Behavior Tracking** — engagement charts, live event feed, behavior profiles
2. **Campaign Analysis** — ROAS/conversion charts, campaign table
3. **Marketing Plan** — AI recommendations + active campaigns
