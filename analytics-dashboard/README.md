# Analytics Dashboard

Standalone Next.js dashboard for the **U9 Myanmar** workspace (BNII Analytics API demo).

- **Overview** (`/`) — combined U9 KPIs
- **U9 Workspace** (`/workspace/u9`) — Atlas-style token economy view
- **Subscribers** (`/customers`) — lifecycle, BNRY, earn channels, cohorts
- **Engagement** (`/marketing`) — STW / Quest / Screen Time campaigns

## Quick start

**Static demo (recommended):** http://localhost:3457

```bash
npm run analytics:demo:refresh   # build + serve on port 3457
# or separately:
npm run analytics:demo           # build analytics-dashboard-demo/
npm run analytics:demo:serve     # serve at http://localhost:3457
```

Live dev server (optional):

```bash
npm install
npm run dev   # → http://localhost:3002
```

From the agenthub root:

```bash
npm run analytics:demo:refresh
```

## Analytics functions

Server-side (pages, API routes, RSC):

```ts
import { analytics, getAnalyticsOverview } from "@/lib/analytics";

const overview = getAnalyticsOverview();
const subscribers = analytics.subscribers();
```

Client-side fetch:

```ts
import { analyticsApi } from "@/lib/api";

const overview = await analyticsApi.overview();
```

Copy into another project: click **Add Files** in the dashboard header, or run `npm run exports:copy:analytics` (see `exports/analytics-feature/README.md`).

Build zip bundles for the Add Files UI:

```bash
npm run analytics:exports
```

## API routes

| Route | Description |
|-------|-------------|
| `GET /api/analytics/overview` | Combined customer + marketing + U9 payload |
| `GET /api/customer-analytics` | Subscriber analytics JSON |
| `GET /api/marketing-analytics` | Engagement / campaign JSON |
| `GET /api/u9-analytics` | U9 workspace dashboard JSON |

## Static HTML demo

Do not double-click `index.html`; use a local server:

```bash
npm run analytics:demo        # build static site
npm run analytics:demo:serve # serve at http://localhost:3457
```

Or double-click `analytics-dashboard-demo/OPEN-DEMO.command` (macOS).

## Source

Feature code originates from:

- `exports/customer-analytics/`
- `exports/marketing-intelligence/`
- `exports/analytics-feature/` — `lib/analytics.ts`, `lib/api.ts`, API routes

Shared UI, layout, and chart utilities are adapted from `telecom-dapp-dashboard`.

## Full telecom command center

For wallet analytics, alerts, agents, and the full command center, use `telecom-dapp-dashboard` (`npm run telecom:dev` on port 3001).

## Static website demo

```bash
npm run analytics:demo
```

Outputs:

- `analytics-dashboard-demo/` — open via local server or `OPEN-DEMO.command`
- `analytics-dashboard-demo.zip` — shareable archive
- Serve locally: `npx serve analytics-dashboard-demo -p 3457`

For GitHub Pages subdirectory (`/analytics-dashboard/`):

```bash
npm run analytics:demo:pages
```
