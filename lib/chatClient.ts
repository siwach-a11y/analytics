import { getStoredKey, MISSING_KEY_ERROR } from "./anthropicKey";

// Model per the Anthropic API reference.
const MODEL = "claude-opus-4-8";

type OnText = (cumulative: string) => void;

/**
 * Streams a chat completion. Tries the server `/api/chat` route first (works
 * when deployed to a backend, e.g. Cloudflare/Vercel). If no backend is
 * available (static GitHub Pages demo), falls back to calling Anthropic
 * directly from the browser using the visitor's own stored key.
 *
 * Returns the final text. Throws an error named MISSING_KEY_ERROR when no
 * backend and no stored key are available.
 */
export async function streamChatResponse(
  prompt: string,
  useWebSearch: boolean,
  onText: OnText
): Promise<string> {
  const server = await tryServer(prompt, useWebSearch, onText);
  if (server.handled) return server.text;

  return streamBrowserDirect(prompt, onText);
}

/**
 * Attempts the server route. Returns handled=false (without emitting any text)
 * when the route is unavailable, so the caller can fall back cleanly.
 */
async function tryServer(
  prompt: string,
  useWebSearch: boolean,
  onText: OnText
): Promise<{ handled: boolean; text: string }> {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, useWebSearch }),
    });
  } catch {
    return { handled: false, text: "" };
  }

  // No backend (static host serves 404/405 for the API path) → fall back.
  if (!res.ok || !res.body) return { handled: false, text: "" };

  const text = await readTextStream(res.body, onText);
  return { handled: true, text };
}

/** Browser-direct call using the visitor's own key (BYO-key demo path). */
async function streamBrowserDirect(
  prompt: string,
  onText: OnText
): Promise<string> {
  const key = getStoredKey();
  if (!key) {
    const err = new Error("Add your Anthropic API key to use AI.");
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
      max_tokens: 1024,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (res.status === 401) {
    throw new Error("Invalid API key. Check the key and re-enter it.");
  }
  if (!res.ok || !res.body) {
    throw new Error(`Anthropic API error: ${res.status}`);
  }

  return readSseTextStream(res.body, onText);
}

/** Reads a plain-text stream (server route emits text directly). */
async function readTextStream(
  body: ReadableStream<Uint8Array>,
  onText: OnText
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  return text;
}

/** Reads Anthropic's SSE stream and accumulates text_delta content. */
async function readSseTextStream(
  body: ReadableStream<Uint8Array>,
  onText: OnText
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const event = JSON.parse(data);
        if (
          event.type === "content_block_delta" &&
          event.delta?.type === "text_delta"
        ) {
          text += event.delta.text;
          onText(text);
        }
      } catch {
        // ignore keep-alives / non-JSON lines
      }
    }
  }
  return text;
}
