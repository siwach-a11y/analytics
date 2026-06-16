import { DEMO_MODE, TICKET_SNIPER_API_URL } from "./config";
import {
  createDemoHunt,
  DEMO_USER_ID,
  getDemoHunts,
  getDemoQueuePositions,
  getDemoSession,
  getDemoSessionTokens,
  resumeDemoSession,
  simulateDemoHuntProgress,
  updateDemoHuntStatus,
} from "./demo";
import { CreateHuntPayload, HuntRecord } from "./types";

export interface HuntsResponse {
  hunts: HuntRecord[];
  queuePositions: Record<string, number>;
  sessionTokens: Record<string, string>;
  demo: boolean;
}

async function apiAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${TICKET_SNIPER_API_URL}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

let useDemo = DEMO_MODE;

async function shouldUseDemo(): Promise<boolean> {
  if (!DEMO_MODE) {
    const available = await apiAvailable();
    if (!available) {
      throw new Error(
        "Ticket Sniper API unavailable. Start ticket-sniper-bot backend or enable demo mode."
      );
    }
    return false;
  }
  if (useDemo) return true;
  const available = await apiAvailable();
  useDemo = !available;
  return useDemo;
}

async function proxyFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${TICKET_SNIPER_API_URL}${path}`, init);
}

export async function serverEnsureUser(email: string): Promise<string> {
  if (await shouldUseDemo()) return DEMO_USER_ID;
  const res = await proxyFetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to create user");
  const data = (await res.json()) as { user: { id: string } };
  return data.user.id;
}

export async function serverFetchHunts(
  userId?: string
): Promise<HuntsResponse> {
  if (await shouldUseDemo()) {
    return {
      hunts: getDemoHunts(userId),
      queuePositions: getDemoQueuePositions(),
      sessionTokens: getDemoSessionTokens(),
      demo: true,
    };
  }
  const url = userId ? `/api/hunts?userId=${userId}` : "/api/hunts";
  const res = await proxyFetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch hunts");
  const data = (await res.json()) as { hunts: HuntRecord[] };
  return {
    hunts: data.hunts,
    queuePositions: {},
    sessionTokens: {},
    demo: false,
  };
}

export async function serverCreateHunt(
  body: CreateHuntPayload
): Promise<HuntRecord> {
  if (await shouldUseDemo())
    return createDemoHunt(body as unknown as Record<string, unknown>);
  const res = await proxyFetch("/api/hunts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create hunt");
  }
  const data = (await res.json()) as { hunt: HuntRecord };
  return data.hunt;
}

export async function serverStartHunt(huntId: string): Promise<void> {
  if (await shouldUseDemo()) {
    simulateDemoHuntProgress(huntId);
    return;
  }
  const res = await proxyFetch(`/api/hunts/${huntId}/start`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to start hunt");
}

export async function serverCancelHunt(huntId: string): Promise<void> {
  if (await shouldUseDemo()) {
    updateDemoHuntStatus(huntId, "CANCELLED");
    return;
  }
  const res = await proxyFetch(`/api/hunts/${huntId}/cancel`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to cancel hunt");
}

export async function serverFetchSession(token: string) {
  if (await shouldUseDemo()) return getDemoSession(token);
  const res = await proxyFetch(`/api/sessions/${token}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Session not found");
  return res.json();
}

export async function serverResumeSession(
  token: string,
  action: "continue" | "submit_otp",
  otp?: string
) {
  if (await shouldUseDemo()) {
    return resumeDemoSession(token, action);
  }
  const res = await proxyFetch(`/api/sessions/${token}/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, otp }),
  });
  if (!res.ok) throw new Error("Failed to resume session");
  return res.json();
}

export async function serverHealthCheck(): Promise<{
  ok: boolean;
  demo: boolean;
  apiUrl: string;
}> {
  try {
    const demo = await shouldUseDemo();
    return { ok: true, demo, apiUrl: TICKET_SNIPER_API_URL };
  } catch {
    return { ok: false, demo: true, apiUrl: TICKET_SNIPER_API_URL };
  }
}
