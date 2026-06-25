# Customer Analytics — Copy Bundle

Self-contained export from `telecom-dapp-dashboard`. Copy this folder into your Next.js project.

## File tree

```
customer-analytics/
├── README.md
├── types/
│   └── customer-analytics.ts          # All TypeScript types for this feature
├── data/
│   ├── customers.json                 # 18 sample customers
│   ├── customer-analytics-series.json # 6-month time series
│   ├── customer-cohorts.json          # Cohort retention matrix
│   └── customer-analytics.ts          # getCustomerAnalytics() data accessor
├── app/
│   ├── customers/
│   │   └── page.tsx                   # Page route → /customers
│   └── api/
│       └── customer-analytics/
│           └── route.ts               # GET /api/customer-analytics
└── components/
    └── analytics/
        ├── customer-analytics-kpi.tsx
        ├── customer-tracking-charts.tsx
        └── customers-table.tsx
```

## After copying — map into your app

| Export path | Paste into your project |
|-------------|-------------------------|
| `types/customer-analytics.ts` | `src/types/customer-analytics.ts` (or merge into `index.ts`) |
| `data/*` | `src/data/` |
| `app/customers/page.tsx` | `src/app/customers/page.tsx` |
| `app/api/customer-analytics/route.ts` | `src/app/api/customer-analytics/route.ts` |
| `components/analytics/*` | `src/components/analytics/` |

## Shared dependencies (not included — you need these)

```
src/lib/formatters.ts          # formatNumber, formatPercent, cnChangeColor, formatRelativeTime
src/lib/chart-theme.ts         # CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_AXIS_TICK
src/lib/alerts.ts              # getUnacknowledgedAlertCount()
src/components/charts/chart-container.tsx
src/components/layout/header.tsx
src/data/index.ts              # getOperatorName()
src/data/telecom-operators.json
src/components/ui/tabs.tsx
src/components/ui/badge.tsx
src/components/ui/input.tsx
src/components/ui/select.tsx
src/components/ui/table.tsx
src/components/ui/progress.tsx
```

## Import path updates

If you use standalone types file, change imports in copied files:

```ts
// From:
import type { CustomerAnalyticsSummary } from "@/types";
// To:
import type { CustomerAnalyticsSummary } from "@/types/customer-analytics";
```

## Sidebar nav entry

```tsx
{ href: "/customers", label: "Customer Analytics", icon: Users },
```

## Route

- Page: `http://localhost:3001/customers`
- API: `GET /api/customer-analytics`
