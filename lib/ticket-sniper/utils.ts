import { HuntStatus, TicketPlatform } from "./types";

export {
  bundleToHuntPayload,
  carToHuntPayload,
  concertToHuntPayload,
  flightToHuntPayload,
  hotelToHuntPayload,
  providerRateToHuntPayload,
  rateToHuntPayload,
} from "./payloads";

export function getStatusLabel(status: HuntStatus): string {
  const labels: Record<HuntStatus, string> = {
    CREATED: "Created",
    WAITING_SALE: "Waiting for Sale",
    QUEUEING: "In Queue",
    SCANNING: "Searching...",
    SEAT_FOUND: "Seat Found",
    RESERVED: "Reserved",
    WAITING_CAPTCHA: "Waiting CAPTCHA",
    WAITING_OTP: "Waiting OTP",
    CHECKOUT: "Checkout",
    COMPLETED: "Completed",
    FAILED: "Failed",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
  };
  return labels[status];
}

export function detectPlatform(url: string): TicketPlatform {
  const host = new URL(url).hostname.toLowerCase();
  if (host.includes("ticketmelon")) return "ticketmelon";
  if (host.includes("thaiticketmajor")) return "thaiticketmajor";
  if (host.includes("livenation") || host.includes("ticketmaster"))
    return "livenation";
  if (host.includes("eventpop")) return "eventpop";
  return "generic";
}

export function statusColor(status: HuntStatus): string {
  if (status === "COMPLETED") return "bg-hub-green-light text-hub-green";
  if (["WAITING_CAPTCHA", "WAITING_OTP", "QUEUEING"].includes(status))
    return "bg-hub-amber-light text-hub-amber";
  if (["FAILED", "EXPIRED", "CANCELLED"].includes(status))
    return "bg-hub-coral-light text-hub-coral";
  if (["SCANNING", "SEAT_FOUND", "RESERVED", "CHECKOUT"].includes(status))
    return "bg-hub-blue-light text-hub-blue";
  return "bg-slate-100 text-slate-600";
}

export function isTerminalStatus(status: HuntStatus): boolean {
  return ["COMPLETED", "FAILED", "EXPIRED", "CANCELLED"].includes(status);
}
