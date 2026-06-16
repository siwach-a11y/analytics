export const TICKET_SNIPER_API_URL =
  process.env.TICKET_SNIPER_API_URL ?? "http://localhost:3002";

export const TICKET_SNIPER_WS_URL =
  process.env.NEXT_PUBLIC_TICKET_SNIPER_WS_URL ?? "ws://localhost:3002/ws";

export const DEMO_MODE =
  process.env.NEXT_PUBLIC_TICKET_SNIPER_DEMO_MODE !== "false";
