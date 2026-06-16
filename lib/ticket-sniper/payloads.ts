import {
  AppointmentSlot,
  CarRental,
  Concert,
  EventDeal,
  ExchangeProvider,
  Flight,
  Hotel,
  JobListing,
  LoanProvider,
  VisaRoute,
} from "@/lib/types";
import { convertCurrency } from "@/lib/currency";
import { CreateHuntPayload, TicketPlatform } from "./types";

export interface SnipeOptions {
  maxRow?: number;
  adjacentSeatsRequired?: boolean;
  quantity: number;
  priorityZones: string[];
  fallbackPriceMin: number;
  fallbackPriceMax: number;
  autoReserve: boolean;
  telegramChatId?: string;
}

export function concertToHuntPayload(
  concert: Concert,
  userId: string,
  options: SnipeOptions
): CreateHuntPayload {
  return {
    userId,
    eventName: `${concert.artist} @ ${concert.venue}`,
    eventUrl: concert.ticketUrl,
    platform: concert.platform,
    saleTime: concert.saleTime ?? undefined,
    quantity: options.quantity,
    priorityZones: options.priorityZones,
    fallbackPriceMin: options.fallbackPriceMin,
    fallbackPriceMax: options.fallbackPriceMax,
    maxRow: options.maxRow ?? 20,
    adjacentSeatsRequired: options.adjacentSeatsRequired ?? false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function flightToHuntPayload(
  flight: Flight,
  userId: string,
  options: SnipeOptions
): CreateHuntPayload {
  return {
    userId,
    eventName: `${flight.airline} ${flight.from}→${flight.to} (${flight.class})`,
    eventUrl: flight.bookingUrl,
    platform: "generic",
    quantity: options.quantity,
    priorityZones: options.priorityZones,
    fallbackPriceMin: options.fallbackPriceMin,
    fallbackPriceMax: options.fallbackPriceMax,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function hotelToHuntPayload(
  hotel: Hotel,
  userId: string,
  options: SnipeOptions & { nights?: number }
): CreateHuntPayload {
  const nights = options.nights ?? 3;
  return {
    userId,
    eventName: `${hotel.name} · ${hotel.city} (${nights} nights)`,
    eventUrl: hotel.bookingUrl,
    platform: "generic",
    quantity: nights,
    priorityZones: options.priorityZones,
    fallbackPriceMin: options.fallbackPriceMin,
    fallbackPriceMax: options.fallbackPriceMax,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function bundleToHuntPayload(
  flight: Flight,
  hotel: Hotel,
  userId: string,
  options: SnipeOptions
): CreateHuntPayload {
  return {
    userId,
    eventName: `Bundle: ${flight.from}→${flight.to} + ${hotel.name}`,
    eventUrl: flight.bookingUrl,
    platform: "generic",
    quantity: options.quantity,
    priorityZones: options.priorityZones,
    fallbackPriceMin: options.fallbackPriceMin,
    fallbackPriceMax: options.fallbackPriceMax,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export type TravelSnipeKind = "flight" | "hotel" | "bundle";

export function travelSnipeToHuntPayload(
  kind: TravelSnipeKind,
  userId: string,
  criteria: {
    from?: string;
    to: string;
    travelClass?: string;
    starRating?: number;
    maxBudget: number;
  },
  options: SnipeOptions
): CreateHuntPayload {
  const destination = criteria.to.trim().toUpperCase();
  const origin = criteria.from?.trim().toUpperCase() ?? "ANY";
  const budget = criteria.maxBudget;

  const eventNames: Record<TravelSnipeKind, string> = {
    flight: `Flight Snipe: ${origin}→${destination}${criteria.travelClass ? ` (${criteria.travelClass})` : ""}`,
    hotel: `Hotel Snipe: ${criteria.to}${criteria.starRating ? ` · ${criteria.starRating}★` : ""}`,
    bundle: `Bundle Snipe: ${origin}→${criteria.to}`,
  };

  const bookingUrls: Record<TravelSnipeKind, string> = {
    flight: `https://www.google.com/travel/flights?q=Flights+from+${origin}+to+${destination}`,
    hotel: `https://www.google.com/travel/hotels/${encodeURIComponent(criteria.to)}`,
    bundle: `https://www.google.com/travel/flights?q=Flights+from+${origin}+to+${destination}`,
  };

  const priorityZones = [
    criteria.travelClass,
    criteria.starRating ? `${criteria.starRating}★` : undefined,
    origin !== "ANY" ? origin : undefined,
    criteria.to,
  ].filter((z): z is string => Boolean(z));

  return {
    userId,
    eventName: eventNames[kind],
    eventUrl: bookingUrls[kind],
    platform: "generic",
    quantity: options.quantity,
    priorityZones: priorityZones.length ? priorityZones : [criteria.to],
    fallbackPriceMin: Math.round(budget * 0.8),
    fallbackPriceMax: budget,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function carToHuntPayload(
  car: CarRental,
  userId: string,
  options: SnipeOptions & { days?: number }
): CreateHuntPayload {
  const days = options.days ?? 3;
  return {
    userId,
    eventName: `${car.company} ${car.model} · ${car.city} (${days} days)`,
    eventUrl: car.bookingUrl,
    platform: "generic",
    quantity: days,
    priorityZones: options.priorityZones,
    fallbackPriceMin: options.fallbackPriceMin,
    fallbackPriceMax: options.fallbackPriceMax,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function rateToHuntPayload(
  from: string,
  to: string,
  userId: string,
  options: {
    targetRate: number;
    amount: number;
    autoReserve: boolean;
    telegramChatId?: string;
  }
): CreateHuntPayload {
  const currentRate = convertCurrency(1, from, to);
  return {
    userId,
    eventName: `Rate Alert: ${from}→${to} @ ${options.targetRate.toFixed(4)}`,
    eventUrl: `https://www.xe.com/currencyconverter/convert/?Amount=1&From=${from}&To=${to}`,
    platform: "generic" as TicketPlatform,
    quantity: 1,
    priorityZones: [from, to],
    fallbackPriceMin: options.targetRate * 0.98,
    fallbackPriceMax: Math.max(currentRate, options.targetRate) * 1.02,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function providerRateToHuntPayload(
  from: string,
  to: string,
  provider: ExchangeProvider,
  userId: string,
  options: {
    targetRate: number;
    amount: number;
    autoReserve: boolean;
    telegramChatId?: string;
  }
): CreateHuntPayload {
  const label = provider.type === "bank" ? "Bank" : "Agent";
  return {
    userId,
    eventName: `${label} Snipe: ${provider.name} ${from}→${to} @ ${options.targetRate.toFixed(4)}`,
    eventUrl: provider.url,
    platform: "generic" as TicketPlatform,
    quantity: 1,
    priorityZones: [from, to, provider.country, provider.type],
    fallbackPriceMin: options.targetRate * 0.98,
    fallbackPriceMax: options.targetRate * 1.02,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function appointmentToHuntPayload(
  slot: AppointmentSlot,
  userId: string,
  options: SnipeOptions
): CreateHuntPayload {
  return {
    userId,
    eventName: `${slot.provider} · ${slot.service}`,
    eventUrl: slot.bookingUrl,
    platform: "generic",
    quantity: options.quantity,
    priorityZones: options.priorityZones,
    fallbackPriceMin: options.fallbackPriceMin,
    fallbackPriceMax: options.fallbackPriceMax,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function jobToHuntPayload(
  job: JobListing,
  userId: string,
  options: SnipeOptions
): CreateHuntPayload {
  return {
    userId,
    eventName: `${job.title} @ ${job.company}`,
    eventUrl: job.applyUrl,
    platform: "generic",
    quantity: 1,
    priorityZones: [...job.tags, job.level, job.type],
    fallbackPriceMin: 0,
    fallbackPriceMax: 999999,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function dealToHuntPayload(
  deal: EventDeal,
  userId: string,
  options: SnipeOptions
): CreateHuntPayload {
  return {
    userId,
    eventName: `${deal.title} (${deal.discount}% off)`,
    eventUrl: deal.dealUrl,
    platform: deal.platform === "ticketmelon" ? "ticketmelon" : "generic",
    saleTime: deal.endsAt,
    quantity: options.quantity,
    priorityZones: options.priorityZones,
    fallbackPriceMin: options.fallbackPriceMin,
    fallbackPriceMax: options.fallbackPriceMax,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function visaToHuntPayload(
  route: VisaRoute,
  userId: string,
  options: SnipeOptions
): CreateHuntPayload {
  return {
    userId,
    eventName: `${route.nationality} → ${route.destination} (${route.visaType})`,
    eventUrl: route.applyUrl,
    platform: "generic",
    quantity: 1,
    priorityZones: [route.visaType, route.destination, route.city],
    fallbackPriceMin: options.fallbackPriceMin,
    fallbackPriceMax: options.fallbackPriceMax,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}

export function loanQuoteToHuntPayload(
  provider: LoanProvider,
  amount: number,
  termMonths: number,
  creditScore: number,
  userId: string,
  options: {
    targetApr: number;
    autoReserve: boolean;
    telegramChatId?: string;
  }
): CreateHuntPayload {
  return {
    userId,
    eventName: `Loan Rate: ${provider.name} ≤${options.targetApr.toFixed(2)}% APR`,
    eventUrl: provider.url,
    platform: "generic",
    quantity: 1,
    priorityZones: [
      provider.type,
      provider.countryCode,
      `$${amount}`,
      `${termMonths}mo`,
      `score${creditScore}`,
    ],
    fallbackPriceMin: options.targetApr * 0.98,
    fallbackPriceMax: options.targetApr * 1.02,
    maxRow: 50,
    adjacentSeatsRequired: false,
    autoReserve: options.autoReserve,
    telegramChatId: options.telegramChatId,
  };
}
