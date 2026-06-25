# Feature Exports — Customer Analytics & Marketing Intelligence

Split copy bundles from `telecom-dapp-dashboard`. **No changes to the running app** — these are duplicates for you to copy elsewhere.

A **ready-to-run dashboard** assembled from both bundles lives in [`analytics-dashboard/`](../../analytics-dashboard/) (`npm run analytics:dev` → port 3002).

**Static website demo** (offline HTML + zip): `npm run analytics:demo` from repo root → `analytics-dashboard-demo/`

## Folders

| Folder | Description | Route |
|--------|-------------|-------|
| [`customer-analytics/`](./customer-analytics/) | Lifecycle, LTV, cohorts, customer directory | `/customers` |
| [`marketing-intelligence/`](./marketing-intelligence/) | Behavior tracking, campaigns, marketing plan | `/marketing` |
| [`analytics-feature/`](./analytics-feature/) | `lib/analytics.ts`, `lib/api.ts`, API routes | API only |

## Quick copy

```bash
# Customer Analytics only
cp -R exports/customer-analytics/{types,data,app,components} your-project/src/

# Marketing Intelligence only
cp -R exports/marketing-intelligence/{types,data,app,components} your-project/src/
```

Or use npm scripts from the repo root (set target with `EXPORT_TARGET` or pass as argument):

```bash
# Customer Analytics → default target: your-project/src
npm run exports:copy:customer

# Marketing Intelligence
npm run exports:copy:marketing

# Both bundles (merges data/app/components into the same target)
npm run exports:copy:all

# Analytics functions + API routes only (requires data layers)
npm run exports:copy:analytics

# Custom target
EXPORT_TARGET=analytics-dashboard/src npm run exports:copy:customer
node scripts/copy-export.mjs marketing-intelligence path/to/your-project/src
```

Each subfolder has its own **README.md** with the full file tree, shared dependencies, and import notes.

## Relationship between features

```
Customer Analytics                    Marketing Intelligence
─────────────────────                 ──────────────────────
customers.json          ───────────►  behavior-event-feed (customer IDs)
                                      behavior-profiles-table
                                      marketing-analytics.ts

customer-analytics.ts                 (optional cross-link on /customers page)
         ▲
         └── link to /marketing on customers page (optional)
```

Marketing can work standalone if you copy `customers.json` (see marketing README).

## Source of truth (live app)

Original files remain in:

```
telecom-dapp-dashboard/src/
├── app/customers/
├── app/marketing/
├── app/api/customer-analytics/
├── app/api/marketing-analytics/
├── components/analytics/customer-*
├── components/analytics/customers-table.tsx
├── components/marketing/
└── data/customer*.json, marketing*.json, *-analytics.ts
```
