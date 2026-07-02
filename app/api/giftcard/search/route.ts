import { getAnthropicClient } from "@/lib/anthropic";
import { buildSearchPrompt, parseSearchResults } from "@/lib/giftcard/prompt";
import { rankResults } from "@/lib/giftcard/rank";
import { getCountry } from "@/lib/giftcard/countries";
import { SearchParams } from "@/lib/giftcard/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MODEL = "claude-opus-4-5";

export async function POST(req: Request) {
  let body: Partial<SearchParams>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const country = (body.country ?? "").trim();
  if (!getCountry(country)) {
    return Response.json({ error: "Unsupported country" }, { status: 400 });
  }
  const params: SearchParams = {
    query: (body.query ?? "").toString(),
    country,
    category: body.category?.toString() || undefined,
    brand: body.brand?.toString() || undefined,
    mode: (body.mode as SearchParams["mode"]) || "all",
  };

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      messages: [{ role: "user", content: buildSearchPrompt(params) }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
    });
    const text = message.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n");
    const results = rankResults(parseSearchResults(text, country));
    return Response.json(results);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Search failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
