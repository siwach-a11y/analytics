export type HuntStatus =
  | "CREATED"
  | "WAITING_SALE"
  | "QUEUEING"
  | "SCANNING"
  | "SEAT_FOUND"
  | "RESERVED"
  | "WAITING_CAPTCHA"
  | "WAITING_OTP"
  | "CHECKOUT"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

export type SessionStatus =
  | "ACTIVE"
  | "WAITING_CAPTCHA"
  | "WAITING_OTP"
  | "RESUMED"
  | "EXPIRED"
  | "CLOSED";

export type TicketPlatform =
  | "ticketmelon"
  | "thaiticketmajor"
  | "livenation"
  | "eventpop"
  | "generic";

export interface EventRecord {
  id: string;
  name: string;
  url: string;
  platform: TicketPlatform;
  saleTime: string | null;
  createdAt: string;
}

export interface HuntRecord {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  priorityZones: string[];
  fallbackPriceMin: number;
  fallbackPriceMax: number;
  maxRow: number;
  adjacentRequired: boolean;
  autoReserve: boolean;
  status: HuntStatus;
  telegramChatId: string | null;
  createdAt: string;
  event?: EventRecord;
}

export interface CreateHuntPayload {
  userId: string;
  eventName: string;
  eventUrl: string;
  platform: TicketPlatform;
  saleTime?: string;
  quantity: number;
  priorityZones: string[];
  fallbackPriceMin: number;
  fallbackPriceMax: number;
  maxRow: number;
  adjacentSeatsRequired: boolean;
  autoReserve: boolean;
  telegramChatId?: string;
}

export interface HuntUpdateMessage {
  type: "HUNT_UPDATE";
  huntId: string;
  payload: {
    status?: HuntStatus;
    queuePosition?: number;
  };
  timestamp: string;
}
