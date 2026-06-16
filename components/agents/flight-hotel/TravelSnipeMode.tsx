"use client";

import { useMemo, useState } from "react";
import { Flight, Hotel } from "@/lib/types";
import {
  bundleToHuntPayload,
  flightToHuntPayload,
  hotelToHuntPayload,
  travelSnipeToHuntPayload,
  TravelSnipeKind,
} from "@/lib/ticket-sniper/payloads";
import { getAirportCity } from "@/lib/travelDestinations";
import SnipeModal from "@/components/sniper/SnipeModal";
import StatusBar from "@/components/ui/StatusBar";

type BundleItem = { flight: Flight; hotel: Hotel; total: number };

interface TravelSnipeModeProps {
  from: string;
  to: string;
  travelClass: string;
  starRating: string;
  maxBudget: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onTravelClassChange: (value: string) => void;
  onStarRatingChange: (value: string) => void;
  onMaxBudgetChange: (value: string) => void;
  filteredFlights: Flight[];
  filteredHotels: Hotel[];
  bundles: BundleItem[];
  onHuntStarted: (eventName: string) => void;
}

const snipeKinds: { id: TravelSnipeKind; label: string; icon: string }[] = [
  { id: "flight", label: "Flight", icon: "✈️" },
  { id: "hotel", label: "Hotel", icon: "🏨" },
  { id: "bundle", label: "Bundle", icon: "🎒" },
];

export default function TravelSnipeMode({
  from,
  to,
  travelClass,
  starRating,
  maxBudget,
  onFromChange,
  onToChange,
  onTravelClassChange,
  onStarRatingChange,
  onMaxBudgetChange,
  filteredFlights,
  filteredHotels,
  bundles,
  onHuntStarted,
}: TravelSnipeModeProps) {
  const [kind, setKind] = useState<TravelSnipeKind>("flight");
  const [showModal, setShowModal] = useState(false);

  const bestFlight = filteredFlights[0] ?? null;
  const bestHotel = filteredHotels[0] ?? null;
  const bestBundle = bundles[0] ?? null;

  const budgetNum = maxBudget ? Number(maxBudget) : 0;
  const estimatedPrice = useMemo(() => {
    if (kind === "flight" && bestFlight) return bestFlight.price;
    if (kind === "hotel" && bestHotel) return bestHotel.pricePerNight * 3;
    if (kind === "bundle" && bestBundle) return bestBundle.total;
    return budgetNum > 0 ? budgetNum : 500;
  }, [kind, bestFlight, bestHotel, bestBundle, budgetNum]);

  const matchLabel = useMemo(() => {
    if (kind === "flight" && bestFlight) {
      return `${bestFlight.airline} ${bestFlight.from}→${bestFlight.to} · $${bestFlight.price}`;
    }
    if (kind === "hotel" && bestHotel) {
      return `${bestHotel.name} · ${bestHotel.city} · $${bestHotel.pricePerNight}/night`;
    }
    if (kind === "bundle" && bestBundle) {
      return `${bestBundle.flight.from}→${getAirportCity(bestBundle.flight.to)} + ${bestBundle.hotel.name} · $${bestBundle.total}`;
    }
    if (!to.trim()) return "Enter a destination to preview matches";
    return `Open hunt on ${kind} route — no exact listing match, using your budget target`;
  }, [kind, bestFlight, bestHotel, bestBundle, to]);

  const canStart = to.trim().length > 0 && (budgetNum > 0 || estimatedPrice > 0);

  const modalConfig = useMemo(() => {
    if (!canStart) return null;

    if (kind === "flight" && bestFlight) {
      return {
        title: "Flight Sniper",
        subtitle: `${bestFlight.airline} · ${bestFlight.from} → ${bestFlight.to}`,
        price: bestFlight.price,
        bookingUrl: bestFlight.bookingUrl,
        quantityLabel: "Passengers",
        quantityDefault: 1,
        priorityZonesDefault: bestFlight.class,
        infoText: "monitors fare drops and seat availability across matching routes, then auto-books.",
        eventName: `${bestFlight.airline} ${bestFlight.from}→${bestFlight.to}`,
        buildPayload: (userId: string, options: Parameters<typeof flightToHuntPayload>[2]) =>
          flightToHuntPayload(bestFlight, userId, options),
        disabled: bestFlight.availability === "sold-out",
      };
    }

    if (kind === "hotel" && bestHotel) {
      return {
        title: "Hotel Sniper",
        subtitle: `${bestHotel.name} · ${bestHotel.city}`,
        price: bestHotel.pricePerNight,
        bookingUrl: bestHotel.bookingUrl,
        quantityLabel: "Nights",
        quantityDefault: 3,
        priorityZonesDefault: bestHotel.amenities.slice(0, 3).join(", "),
        infoText: "watches room rates and availability in your target city, then auto-books.",
        eventName: `${bestHotel.name} · ${bestHotel.city}`,
        buildPayload: (userId: string, options: Parameters<typeof hotelToHuntPayload>[2]) =>
          hotelToHuntPayload(bestHotel, userId, { ...options, nights: options.quantity }),
        disabled: bestHotel.availability === "sold-out",
      };
    }

    if (kind === "bundle" && bestBundle) {
      return {
        title: "Bundle Sniper",
        subtitle: `${bestBundle.flight.from} → ${bestBundle.flight.to} + ${bestBundle.hotel.name}`,
        price: bestBundle.total,
        bookingUrl: bestBundle.flight.bookingUrl,
        quantityLabel: "Travelers",
        quantityDefault: 1,
        priorityZonesDefault: `${bestBundle.flight.class}, ${bestBundle.hotel.city}`,
        infoText: "monitors flight + hotel bundle pricing and auto-books when your target is met.",
        eventName: `Bundle: ${bestBundle.flight.from}→${bestBundle.flight.to}`,
        buildPayload: (userId: string, options: Parameters<typeof bundleToHuntPayload>[3]) =>
          bundleToHuntPayload(bestBundle.flight, bestBundle.hotel, userId, options),
        disabled:
          bestBundle.flight.availability === "sold-out" ||
          bestBundle.hotel.availability === "sold-out",
      };
    }

    const targetBudget = budgetNum > 0 ? budgetNum : estimatedPrice;
    const titles: Record<TravelSnipeKind, string> = {
      flight: "Flight Sniper",
      hotel: "Hotel Sniper",
      bundle: "Bundle Sniper",
    };
    const subtitles: Record<TravelSnipeKind, string> = {
      flight: from ? `${from.toUpperCase()} → ${to}` : `Any origin → ${to}`,
      hotel: `${to} · open hunt`,
      bundle: from ? `${from.toUpperCase()} → ${to} + hotel` : `${to} bundle hunt`,
    };

    return {
      title: titles[kind],
      subtitle: subtitles[kind],
      price: targetBudget,
      bookingUrl: `https://www.google.com/travel/flights?q=${encodeURIComponent(to)}`,
      quantityLabel: kind === "hotel" ? "Nights" : kind === "bundle" ? "Travelers" : "Passengers",
      quantityDefault: kind === "hotel" ? 3 : 1,
      priorityZonesDefault: [travelClass !== "All" ? travelClass : "", starRating !== "All" ? `${starRating}★` : ""]
        .filter(Boolean)
        .join(", "),
      infoText: "monitors matching travel inventory and auto-books when your price target is hit.",
      eventName: subtitles[kind],
      buildPayload: (userId: string, options: Parameters<typeof travelSnipeToHuntPayload>[3]) =>
        travelSnipeToHuntPayload(
          kind,
          userId,
          {
            from: from || undefined,
            to,
            travelClass: travelClass !== "All" ? travelClass : undefined,
            starRating: starRating !== "All" ? Number(starRating) : undefined,
            maxBudget: targetBudget,
          },
          options
        ),
      disabled: false,
    };
  }, [
    canStart,
    kind,
    bestFlight,
    bestHotel,
    bestBundle,
    from,
    to,
    travelClass,
    starRating,
    budgetNum,
    estimatedPrice,
  ]);

  return (
    <>
      <div className="glass-panel p-5 space-y-5 border-hub-blue/15 bg-gradient-to-br from-hub-blue-light/30 to-white/80">
        <div>
          <h3 className="font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🎯</span> Snipe Mode
          </h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Set your route and budget, then launch a Ticket Sniper hunt that
            watches fares, rooms, or bundles and auto-books when your target is
            met.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {snipeKinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={
                kind === k.id ? "chip-filter chip-filter-active" : "chip-filter chip-filter-inactive"
              }
            >
              {k.icon} {k.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kind !== "hotel" && (
            <input
              type="text"
              placeholder="From (airport code)"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className="input-modern"
            />
          )}
          <input
            type="text"
            placeholder={kind === "hotel" ? "City" : "To (city or airport)"}
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="input-modern"
          />
          {kind !== "hotel" && (
            <select
              value={travelClass}
              onChange={(e) => onTravelClassChange(e.target.value)}
              className="input-modern"
            >
              <option value="All">All Classes</option>
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          )}
          {kind !== "flight" && (
            <select
              value={starRating}
              onChange={(e) => onStarRatingChange(e.target.value)}
              className="input-modern"
            >
              <option value="All">All Stars</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          )}
          <input
            type="number"
            placeholder={
              kind === "hotel"
                ? "Max nightly rate ($)"
                : kind === "bundle"
                  ? "Max bundle total ($)"
                  : "Max fare ($)"
            }
            value={maxBudget}
            onChange={(e) => onMaxBudgetChange(e.target.value)}
            className="input-modern"
          />
        </div>

        <div className="rounded-xl p-3.5 text-sm bg-white/90 border border-white shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
            Hunt preview
          </p>
          <p className="text-slate-700">{matchLabel}</p>
          {estimatedPrice > 0 && (
            <p className="text-hub-blue font-semibold mt-1">
              Est. snipe value: ${estimatedPrice.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={!canStart || modalConfig?.disabled}
            className="btn-coral"
          >
            🎯 Launch {kind === "flight" ? "Flight" : kind === "hotel" ? "Hotel" : "Bundle"} Snipe
          </button>
          <StatusBar
            status="idle"
            message={
              canStart
                ? "Ready to start hunt"
                : "Enter destination and max budget to snipe"
            }
          />
        </div>
      </div>

      {showModal && modalConfig && (
        <SnipeModal
          title={modalConfig.title}
          subtitle={modalConfig.subtitle}
          price={modalConfig.price}
          bookingUrl={modalConfig.bookingUrl}
          disabled={modalConfig.disabled}
          quantityLabel={modalConfig.quantityLabel}
          quantityDefault={modalConfig.quantityDefault}
          priorityZonesDefault={modalConfig.priorityZonesDefault}
          infoText={modalConfig.infoText}
          eventName={modalConfig.eventName}
          buildPayload={modalConfig.buildPayload}
          onClose={() => setShowModal(false)}
          onHuntStarted={(name) => {
            onHuntStarted(name);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
