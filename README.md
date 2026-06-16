# AgentHub

AI agent marketplace with snipe-mode demos for travel, entertainment, and finance.

## Live demo

**GitHub Pages:** [https://siwach-a11y.github.io/agent-hub/](https://siwach-a11y.github.io/agent-hub/)

Start at `summary.html` for the platform overview, or `index.html` for the marketplace.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the dev server shows 500 errors or missing styles, reset the cache:

```bash
npm run dev:clean
```

## Static export (offline demo folder)

```bash
npm run build:html
```

Outputs a shareable folder at `agenthub-demo/` and `agenthub-demo.zip`.

## GitHub Pages deploy

Pushes to `main` run `.github/workflows/deploy-pages.yml`, which builds with `npm run build:pages` and publishes the `out/` directory.

Manual build for Pages (uses `/agent-hub` base path):

```bash
npm run build:pages
```

## Agents

- Concert Ticket Finder
- Flight & Hotel Finder (includes Snipe Mode)
- Currency Exchange
- Car Rental Finder
- Event Deal & Flash Sale
- Event Deal Hunter
- Personal Loan Finder

Snipe hunts run in browser demo mode on the static build (no backend required). A 2.5% platform fee applies on every snipe in the UI.
