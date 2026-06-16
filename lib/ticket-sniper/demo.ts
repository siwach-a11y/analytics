import { HuntRecord, HuntStatus, TicketPlatform } from "./types";

export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

interface DemoStore {
  hunts: HuntRecord[];
  queue: Record<string, number>;
  sessions: Record<
    string,
    { huntId: string; status: "WAITING_CAPTCHA" | "WAITING_OTP" }
  >;
  huntSessionTokens: Record<string, string>;
  timers: Map<string, ReturnType<typeof setTimeout>[]>;
}

const globalKey = "__agenthubSniperDemo" as const;

function getStore(): DemoStore {
  const g = globalThis as typeof globalThis & {
    [globalKey]?: DemoStore;
  };
  if (!g[globalKey]) {
    const now = new Date().toISOString();
    g[globalKey] = {
      hunts: [
        {
          userId: DEMO_USER_ID,
          eventId: "20000000-0000-4000-8000-000000000001",
          quantity: 2,
          priorityZones: ["GA", "Floor"],
          fallbackPriceMin: 100,
          fallbackPriceMax: 500,
          maxRow: 20,
          adjacentRequired: true,
          autoReserve: true,
          telegramChatId: null,
          createdAt: now,
          id: "10000000-0000-4000-8000-000000000001",
          status: "SCANNING",
          event: {
            id: "20000000-0000-4000-8000-000000000001",
            name: "Taylor Swift @ SoFi Stadium",
            url: "https://www.livenation.com/event/taylor-swift",
            platform: "livenation",
            saleTime: now,
            createdAt: now,
          },
        },
      ],
      queue: { "10000000-0000-4000-8000-000000000001": 187 },
      sessions: {
        "demo-captcha-session": {
          huntId: "10000000-0000-4000-8000-000000000001",
          status: "WAITING_CAPTCHA",
        },
      },
      huntSessionTokens: {},
      timers: new Map(),
    };
  }
  return g[globalKey]!;
}

function clearHuntTimers(huntId: string) {
  const store = getStore();
  const timers = store.timers.get(huntId) ?? [];
  timers.forEach(clearTimeout);
  store.timers.delete(huntId);
}

function schedule(huntId: string, fn: () => void, ms: number) {
  const store = getStore();
  const timer = setTimeout(fn, ms);
  const list = store.timers.get(huntId) ?? [];
  list.push(timer);
  store.timers.set(huntId, list);
}

export function getDemoHunts(userId?: string): HuntRecord[] {
  if (userId && userId !== DEMO_USER_ID) return [];
  return [...getStore().hunts];
}

export function getDemoQueuePositions(): Record<string, number> {
  return { ...getStore().queue };
}

export function getDemoSessionTokens(): Record<string, string> {
  return { ...getStore().huntSessionTokens };
}

export function createDemoHunt(body: Record<string, unknown>): HuntRecord {
  const hunt: HuntRecord = {
    id: crypto.randomUUID(),
    userId: DEMO_USER_ID,
    eventId: crypto.randomUUID(),
    quantity: Number(body.quantity) || 1,
    priorityZones: (body.priorityZones as string[]) ?? [],
    fallbackPriceMin: Number(body.fallbackPriceMin) || 0,
    fallbackPriceMax: Number(body.fallbackPriceMax) || 999999,
    maxRow: Number(body.maxRow) || 50,
    adjacentRequired: Boolean(body.adjacentSeatsRequired),
    autoReserve: body.autoReserve !== false,
    status: "CREATED",
    telegramChatId: (body.telegramChatId as string) ?? null,
    createdAt: new Date().toISOString(),
    event: {
      id: crypto.randomUUID(),
      name: String(body.eventName ?? "New Event"),
      url: String(body.eventUrl ?? "https://example.com"),
      platform: (body.platform as TicketPlatform) ?? "generic",
      saleTime: (body.saleTime as string) ?? null,
      createdAt: new Date().toISOString(),
    },
  };
  const store = getStore();
  store.hunts = [hunt, ...store.hunts];
  return hunt;
}

export function updateDemoHuntStatus(
  huntId: string,
  status: HuntStatus
): void {
  const store = getStore();
  store.hunts = store.hunts.map((h) =>
    h.id === huntId ? { ...h, status } : h
  );

  if (status === "QUEUEING") {
    store.queue[huntId] = Math.floor(Math.random() * 300) + 50;
  }
  if (status === "SCANNING" && store.queue[huntId]) {
    const tick = setInterval(() => {
      if (store.queue[huntId] > 1) {
        store.queue[huntId] -= Math.floor(Math.random() * 15) + 5;
      } else {
        clearInterval(tick);
      }
    }, 1500);
    schedule(huntId, () => clearInterval(tick), 8000);
  }
  if (status === "CANCELLED" || status === "COMPLETED" || status === "FAILED") {
    clearHuntTimers(huntId);
    delete store.queue[huntId];
    delete store.huntSessionTokens[huntId];
  }
}

function createDemoSessionForHunt(
  huntId: string,
  type: "WAITING_CAPTCHA" | "WAITING_OTP"
) {
  const store = getStore();
  const token = `demo-${huntId.slice(0, 8)}-${type === "WAITING_CAPTCHA" ? "captcha" : "otp"}`;
  store.sessions[token] = { huntId, status: type };
  store.huntSessionTokens[huntId] = token;
}

export function simulateDemoHuntProgress(huntId: string): void {
  clearHuntTimers(huntId);

  const steps: { status: HuntStatus; delay: number; after?: () => void }[] = [
    { status: "WAITING_SALE", delay: 300 },
    { status: "QUEUEING", delay: 800 },
    { status: "SCANNING", delay: 1500 },
    { status: "SEAT_FOUND", delay: 1500 },
    { status: "RESERVED", delay: 1000 },
    {
      status: "WAITING_CAPTCHA",
      delay: 1000,
      after: () => createDemoSessionForHunt(huntId, "WAITING_CAPTCHA"),
    },
  ];

  let elapsed = 0;
  for (const step of steps) {
    elapsed += step.delay;
    schedule(
      huntId,
      () => {
        updateDemoHuntStatus(huntId, step.status);
        step.after?.();
      },
      elapsed
    );
  }
}

export function getDemoSession(token: string) {
  const store = getStore();
  const session = store.sessions[token];
  if (!session) {
    throw new Error("Session not found");
  }

  const hunt = store.hunts.find((h) => h.id === session.huntId);

  return {
    session: {
      id: `demo-session-${token}`,
      huntId: session.huntId,
      sessionToken: token,
      status: session.status,
      hunt: {
        status: hunt?.status ?? session.status,
        events: { name: hunt?.event?.name ?? "Demo Event" },
      },
      createdAt: new Date().toISOString(),
    },
  };
}

export function resumeDemoSession(
  token: string,
  action: "continue" | "submit_otp"
) {
  const store = getStore();
  const session = store.sessions[token];
  if (!session) throw new Error("Session not found");

  const { huntId } = session;

  if (action === "submit_otp") {
    updateDemoHuntStatus(huntId, "CHECKOUT");
    schedule(huntId, () => updateDemoHuntStatus(huntId, "COMPLETED"), 2000);
  } else if (session.status === "WAITING_CAPTCHA") {
    updateDemoHuntStatus(huntId, "SCANNING");
    schedule(huntId, () => updateDemoHuntStatus(huntId, "CHECKOUT"), 2000);
    schedule(huntId, () => updateDemoHuntStatus(huntId, "COMPLETED"), 4000);
  } else {
    updateDemoHuntStatus(huntId, "CHECKOUT");
    schedule(huntId, () => updateDemoHuntStatus(huntId, "COMPLETED"), 2000);
  }

  delete store.sessions[token];
  delete store.huntSessionTokens[huntId];

  return { ok: true, status: "RESUMED", demo: true };
}
