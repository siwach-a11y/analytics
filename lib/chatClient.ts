// Chat endpoint resolution:
// - Normal (server) build: call the local Next.js `/api/chat` route, which
//   holds ANTHROPIC_API_KEY server-side.
// - Static GitHub Pages demo (NEXT_PUBLIC_STATIC_DEMO=true): there is no
//   server, so call a serverless proxy whose URL is baked in via
//   NEXT_PUBLIC_CHAT_PROXY_URL. The proxy holds the API key as a server-side
//   secret — no key is ever embedded in this client bundle.
const STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === "true";
const PROXY_URL = process.env.NEXT_PUBLIC_CHAT_PROXY_URL;

/**
 * Streams a chat completion, invoking `onText` with the cumulative text so far.
 * Both endpoints return a plain-text stream of the assistant's message.
 * Returns the final text.
 */
export async function streamChatResponse(
  prompt: string,
  useWebSearch: boolean,
  onText: (cumulative: string) => void
): Promise<string> {
  const endpoint = STATIC_DEMO ? PROXY_URL : "/api/chat";
  if (!endpoint) {
    throw new Error(
      "AI is not configured for this static demo (no chat proxy set)."
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, useWebSearch }),
  });
  if (!res.ok) throw new Error("Failed to get response");

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let text = "";
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
  }
  return text;
}
