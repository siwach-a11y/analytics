# Chat proxy (Cloudflare Worker)

A tiny serverless proxy so the static GitHub Pages demo can use the AI
assistant. The Anthropic API key is stored as a **Worker secret** — it never
reaches the browser or the repo.

## Deploy — Cloudflare dashboard (no CLI needed)

1. Go to <https://dash.cloudflare.com> → **Workers & Pages** → **Create** →
   **Create Worker**. Name it e.g. `voucher-chat-proxy`, click **Deploy**.
2. Click **Edit code**, delete the template, paste the contents of
   [`worker.js`](worker.js), then **Deploy**.
3. Open the Worker → **Settings** → **Variables and Secrets** →
   **Add** a secret:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your (spend-capped) Anthropic key
   - Type: **Secret** (encrypted). **Save and deploy.**
4. Copy the Worker URL (e.g. `https://voucher-chat-proxy.<you>.workers.dev`).

## Deploy — CLI (alternative)

```bash
cd proxy
npx wrangler deploy
npx wrangler secret put ANTHROPIC_API_KEY   # paste the key when prompted
```

## Wire it into the site

Rebuild the Pages site with the proxy URL and redeploy:

```bash
NEXT_PUBLIC_CHAT_PROXY_URL="https://voucher-chat-proxy.<you>.workers.dev" \
PAGES_BASE_PATH=/voucher-agent \
npm run build:pages
# then publish out/ to the gh-pages branch
```

## Notes

- CORS is locked to `https://siwach-a11y.github.io` in `worker.js`
  (`ALLOWED_ORIGIN`). Change it if the demo moves.
- The key lives only in the Worker's encrypted secret store — safe to keep the
  Worker public. Rotate the key anytime in the Anthropic console; just update
  the secret.
