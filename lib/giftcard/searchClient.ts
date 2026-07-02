import { getStoredKey, MISSING_KEY_ERROR } from "@/lib/anthropicKey";
import { buildSearchPrompt, parseSearchResults } from "./prompt";
import { rankResults } from "./rank";
import { SearchParams, SearchResults } from "./types";

const MODEL = "claude-opus-4-5";

/**
 * Run the gift-card & coupon search. Tries the server `/api/giftcard/search`
 * route first (Cloud Run / local dev), then falls back to a direct Anthropic
 * call from the browser using the visitor's own key (static GitHub Pages demo).
 */
export async function searchGiftCardsAndCoupons(
  params: SearchParams
): Promise<SearchResults> {
  // 1. Server route
  try {
    const res = await fetch("/api/giftcard/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && !data.error) return data as SearchResults;
    }
  } catch {
    /* no backend — fall through to browser-direct */
  }

  // 2. Browser-direct with the visitor's own key
  const key = getStoredKey();
  if (!key) {
    const err = new Error("Add your Anthropic API key to search.");
    err.name = MISSING_KEY_ERROR;
    throw err;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      messages: [{ role: "user", content: buildSearchPrompt(params) }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
    }),
  });

  if (res.status === 401) throw new Error("Invalid API key. Check the key and re-enter it.");
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);

  const data = await res.json();
  const text = (data.content ?? [])
    .map((b: { type: string; text?: string }) => (b.type === "text" ? b.text ?? "" : ""))
    .join("\n");
  return rankResults(parseSearchResults(text, params.country));
}
