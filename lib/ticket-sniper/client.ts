import { CreateHuntPayload, HuntRecord } from "./types";
import {
  createDemoHunt,
  DEMO_USER_ID,
  getDemoHunts,
  getDemoQueuePositions,
  getDemoSession,
  getDemoSessionTokens,
  resumeDemoSession,
  simulateDemoHuntProgress,
} from "./demo";

const BASE = "/api/ticket-sniper";
const USER_ID_KEY = "agenthub_sniper_user_id";

export interface HuntsFetchResult {
  hunts: HuntRecord[];
  queuePositions: Record<string, number>;
  sessionTokens: Record<string, string>;
  demo: boolean;
}

const isStaticDemo = () =>
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_STATIC_DEMO === "true";

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function storeUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id);
}

export async function ensureUser(email?: string): Promise<string> {
  if (isStaticDemo()) {
    const stored = getStoredUserId();
    if (stored) return stored;
    storeUserId(DEMO_USER_ID);
    return DEMO_USER_ID;
  }

  const stored = getStoredUserId();
  if (stored) return stored;

  const res = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email ?? "user@agenthub.local" }),
  });
  if (!res.ok) throw new Error("Failed to create user");
  const data = (await res.json()) as { userId: string };
  storeUserId(data.userId);
  return data.userId;
}

export async function fetchHunts(userId?: string): Promise<HuntsFetchResult> {
  if (isStaticDemo()) {
    return {
      hunts: getDemoHunts(userId),
      queuePositions: getDemoQueuePositions(),
      sessionTokens: getDemoSessionTokens(),
      demo: true,
    };
  }

  const url = userId ? `${BASE}/hunts?userId=${userId}` : `${BASE}/hunts`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch hunts");
  return res.json();
}

export async function createHunt(
  body: CreateHuntPayload
): Promise<HuntRecord> {
  if (isStaticDemo()) {
    return createDemoHunt(body as unknown as Record<string, unknown>);
  }

  const res = await fetch(`${BASE}/hunts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ?? "Failed to create hunt"
    );
  }
  const data = (await res.json()) as { hunt: HuntRecord };
  return data.hunt;
}

export async function startHunt(huntId: string): Promise<void> {
  if (isStaticDemo()) {
    simulateDemoHuntProgress(huntId);
    return;
  }

  const res = await fetch(`${BASE}/hunts/${huntId}/start`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to start hunt");
}

export async function cancelHunt(huntId: string): Promise<void> {
  if (isStaticDemo()) return;

  const res = await fetch(`${BASE}/hunts/${huntId}/cancel`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to cancel hunt");
}

export async function fetchSession(token: string) {
  if (isStaticDemo()) {
    return getDemoSession(token);
  }

  const res = await fetch(`${BASE}/sessions/${token}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Session not found");
  return res.json();
}

export async function resumeSession(
  token: string,
  action: "continue" | "submit_otp",
  otp?: string
) {
  if (isStaticDemo()) {
    return resumeDemoSession(token, action);
  }

  const res = await fetch(`${BASE}/sessions/${token}/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, otp }),
  });
  if (!res.ok) throw new Error("Failed to resume session");
  return res.json();
}

export async function checkSniperHealth(): Promise<{
  demo: boolean;
  ok: boolean;
}> {
  if (isStaticDemo()) {
    return { demo: true, ok: true };
  }

  const res = await fetch(`${BASE}/health`);
  if (!res.ok) return { demo: true, ok: false };
  return res.json();
}
