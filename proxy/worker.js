// Cloudflare Worker: chat proxy for the static AgentHub demo.
//
// Holds the Anthropic API key as a server-side secret (env.ANTHROPIC_API_KEY)
// so it is NEVER shipped to the browser. The static site calls this Worker;
// the Worker calls Anthropic and streams back plain text.
//
// Deploy: see proxy/README.md. Set the secret with:
//   wrangler secret put ANTHROPIC_API_KEY
// (or in the Cloudflare dashboard: Worker → Settings → Variables → add a
// secret named ANTHROPIC_API_KEY).

const MODEL = "claude-sonnet-4-5";

// Restrict browser calls to the demo origin. Change to "*" to allow any origin.
const ALLOWED_ORIGIN = "https://siwach-a11y.github.io";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders();

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }
    if (!env.ANTHROPIC_API_KEY) {
      return new Response("Proxy misconfigured: no API key", {
        status: 500,
        headers: cors,
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: cors });
    }

    const prompt = body?.prompt;
    if (!prompt || typeof prompt !== "string") {
      return new Response("Missing prompt", { status: 400, headers: cors });
    }
    const useWebSearch = Boolean(body?.useWebSearch);

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        stream: true,
        messages: [{ role: "user", content: prompt }],
        ...(useWebSearch
          ? {
              tools: [
                { type: "web_search_20250305", name: "web_search", max_uses: 5 },
              ],
            }
          : {}),
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return new Response(`Upstream error ${upstream.status}: ${detail}`, {
        status: 502,
        headers: cors,
      });
    }

    // Transform Anthropic's SSE stream into a plain-text stream of deltas.
    const { readable, writable } = new TransformStream();
    (async () => {
      const writer = writable.getWriter();
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const data = t.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const ev = JSON.parse(data);
              if (
                ev.type === "content_block_delta" &&
                ev.delta?.type === "text_delta"
              ) {
                await writer.write(encoder.encode(ev.delta.text));
              }
            } catch {
              // ignore keep-alives / non-JSON
            }
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...cors,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  },
};
