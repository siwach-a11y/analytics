"use client";

import { useState, useMemo } from "react";
import { flights } from "@/lib/data/flights";
import { hotels } from "@/lib/data/hotels";
import { Flight, Hotel } from "@/lib/types";
import {
  citiesMatchForBundle,
  flightMatchesRoute,
  getAirportCity,
  resolveDestinationQuery,
} from "@/lib/travelDestinations";
import {
  bundleToHuntPayload,
  flightToHuntPayload,
  hotelToHuntPayload,
} from "@/lib/ticket-sniper/payloads";
import TabSwitcher from "@/components/ui/TabSwitcher";
import ResultCard from "@/components/ui/ResultCard";
import AIChat, { useAIResponse } from "@/components/ui/AIChat";
import StatusBar from "@/components/ui/StatusBar";
import SniperBanner from "@/components/sniper/SniperBanner";
import SnipeSuccess from "@/components/sniper/SnipeSuccess";
import HuntStatusPanel from "@/components/sniper/HuntStatusPanel";
import SnipeModal from "@/components/sniper/SnipeModal";
import TravelSnipeMode from "@/components/agents/flight-hotel/TravelSnipeMode";
import { useSniperState } from "@/components/sniper/useSniperState";

const tabs = [
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
  { id: "bundle", label: "Bundle" },
  { id: "snipe", label: "🎯 Snipe Mode" },
];

type BundleItem = {
  flight: Flight;
  hotel: Hotel;
  total: number;
};

export default function FlightHotelAgent() {
  const [activeTab, setActiveTab] = useState("flights");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [travelClass, setTravelClass] = useState("All");
  const [starRating, setStarRating] = useState("All");
  const [maxBudget, setMaxBudget] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [snipeFlight, setSnipeFlight] = useState<Flight | null>(null);
  const [snipeHotel, setSnipeHotel] = useState<Hotel | null>(null);
  const [snipeBundle, setSnipeBundle] = useState<BundleItem | null>(null);
  const { huntRefreshKey, snipeSuccess, onHuntStarted } = useSniperState();
  const { response, isLoading, ask } = useAIResponse();

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      if (!flightMatchesRoute(from, to, f.from, f.to)) return false;
      if (travelClass !== "All" && f.class !== travelClass) return false;
      if (activeTab !== "bundle" && maxBudget && f.price > Number(maxBudget))
        return false;
      return true;
    });
  }, [from, to, travelClass, maxBudget, activeTab]);

  const filteredHotels = useMemo(() => {
    const cityQuery = to ? resolveDestinationQuery(to) : "";
    return hotels.filter((h) => {
      if (cityQuery && !h.city.toLowerCase().includes(cityQuery.toLowerCase()))
        return false;
      if (starRating !== "All" && h.stars !== Number(starRating)) return false;
      if (activeTab !== "bundle" && maxBudget && h.pricePerNight > Number(maxBudget))
        return false;
      return true;
    });
  }, [to, starRating, maxBudget, activeTab]);

  const bundles = useMemo(() => {
    const nights = 3;
    const results: BundleItem[] = [];

    for (const f of filteredFlights) {
      const matchingHotels = filteredHotels.filter((h) =>
        citiesMatchForBundle(f.to, h.city)
      );

      for (const h of matchingHotels) {
        const total = f.price + h.pricePerNight * nights;
        if (maxBudget && total > Number(maxBudget)) continue;
        results.push({ flight: f, hotel: h, total });
      }
    }

    return results.sort((a, b) => a.total - b.total).slice(0, 12);
  }, [filteredFlights, filteredHotels, maxBudget]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 400);
  };

  const handleFlightDetails = (f: Flight) => {
    ask(
      `Tell me about the ${f.airline} flight from ${f.from} to ${f.to}, departing ${f.departure}, ${f.class} class, $${f.price}. Include baggage policy and airport tips.`
    );
  };

  const handleHotelDetails = (h: Hotel) => {
    ask(
      `Tell me about ${h.name} in ${h.city}, a ${h.stars}-star hotel at $${h.pricePerNight}/night. Amenities: ${h.amenities.join(", ")}.`
    );
  };

  return (
    <div className="space-y-6">
      <SniperBanner
        accent="blue"
        description={
          <>
            Use <strong>Snipe Mode</strong> to hunt by route and budget, or click{" "}
            <strong>Snipe</strong> on any flight, hotel, or bundle to monitor
            prices and auto-book via Ticket Sniper Bot.
          </>
        }
      />

      {snipeSuccess && <SnipeSuccess message={snipeSuccess} />}

      <HuntStatusPanel refreshKey={huntRefreshKey} />

      <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "snipe" ? (
        <TravelSnipeMode
          from={from}
          to={to}
          travelClass={travelClass}
          starRating={starRating}
          maxBudget={maxBudget}
          onFromChange={setFrom}
          onToChange={setTo}
          onTravelClassChange={setTravelClass}
          onStarRatingChange={setStarRating}
          onMaxBudgetChange={setMaxBudget}
          filteredFlights={filteredFlights}
          filteredHotels={filteredHotels}
          bundles={bundles}
          onHuntStarted={onHuntStarted}
        />
      ) : (
        <>
      <div className="glass-panel p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(activeTab === "flights" || activeTab === "bundle") && (
            <input
              type="text"
              placeholder="From (airport code)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input-modern"
            />
          )}
          <input
            type="text"
            placeholder={
              activeTab === "hotels"
                ? "City"
                : activeTab === "bundle"
                  ? "To (city or airport)"
                  : "To (city/code)"
            }
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input-modern"
          />
          {activeTab !== "hotels" && (
            <select
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value)}
              className="input-modern"
            >
              <option value="All">All Classes</option>
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          )}
          {activeTab !== "flights" && (
            <select
              value={starRating}
              onChange={(e) => setStarRating(e.target.value)}
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
              activeTab === "bundle" ? "Max bundle total ($)" : "Max budget ($)"
            }
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="input-modern"
          />
        </div>

        <button onClick={handleSearch} className="btn-primary">
          Search
        </button>

        <StatusBar
          status={isSearching ? "thinking" : "idle"}
          message={
            activeTab === "flights"
              ? `${filteredFlights.length} flights found`
              : activeTab === "hotels"
                ? `${filteredHotels.length} hotels found`
                : `${bundles.length} bundles found`
          }
        />
      </div>

      {activeTab === "flights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFlights.map((f) => (
            <ResultCard
              key={f.id}
              icon="✈️"
              title={`${f.airline}: ${f.from} → ${f.to}`}
              subtitle={`${f.departure} - ${f.arrival} · ${f.duration}`}
              price={`$${f.price}`}
              meta={[f.class, f.stops === 0 ? "Nonstop" : `${f.stops} stop`]}
              availability={f.availability}
              actionLabel="Snipe Flight"
              onAction={() => setSnipeFlight(f)}
              onDetails={() => handleFlightDetails(f)}
              onAlternatives={() =>
                ask(
                  `Suggest cheaper alternative flights from ${f.from} to ${f.to} in ${f.class} class.`
                )
              }
            />
          ))}
        </div>
      )}

      {activeTab === "hotels" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHotels.map((h) => (
            <ResultCard
              key={h.id}
              icon="🏨"
              title={h.name}
              subtitle={`${h.city} · ${"★".repeat(h.stars)}`}
              price={`$${h.pricePerNight}/night`}
              meta={h.amenities.slice(0, 3)}
              availability={h.availability}
              actionLabel="Snipe Hotel"
              onAction={() => setSnipeHotel(h)}
              onDetails={() => handleHotelDetails(h)}
              onAlternatives={() =>
                ask(
                  `Suggest similar ${h.stars}-star hotels in ${h.city} under $${h.pricePerNight}/night.`
                )
              }
            />
          ))}
        </div>
      )}

      {activeTab === "bundle" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundles.map((b) => (
            <ResultCard
              key={`${b.flight.id}-${b.hotel.id}`}
              icon="🎒"
              title={`${b.flight.from} → ${getAirportCity(b.flight.to)} + ${b.hotel.name}`}
              subtitle={`${b.flight.airline} · ${b.flight.departure} · ${b.hotel.stars}★ · 3 nights`}
              price={`$${b.total}`}
              meta={[b.flight.class, b.hotel.city]}
              availability={
                b.flight.availability === "sold-out" ||
                b.hotel.availability === "sold-out"
                  ? "sold-out"
                  : b.flight.availability === "few-left" ||
                      b.hotel.availability === "few-left"
                    ? "few-left"
                    : "available"
              }
              actionLabel="Snipe Bundle"
              onAction={() => setSnipeBundle(b)}
              onDetails={() =>
                ask(
                  `Compare this travel bundle: ${b.flight.airline} flight ${b.flight.from} to ${getAirportCity(b.flight.to)} ($${b.flight.price}) + ${b.hotel.name} in ${b.hotel.city} ($${b.hotel.pricePerNight}/night for 3 nights). Total: $${b.total}. Is this a good deal?`
                )
              }
            />
          ))}
          {bundles.length === 0 && (
            <div className="empty-state md:col-span-2">
              No bundles match your route. Try a destination with both flights and
              hotels — e.g. Tokyo, London, Paris, New York, Miami.
            </div>
          )}
        </div>
      )}
      </>
      )}

      {response && (
        <div className="glass-panel p-5 border-hub-purple/15 bg-hub-purple-light/30">
          <StatusBar status={isLoading ? "thinking" : "idle"} />
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-2">
            {response}
          </p>
        </div>
      )}

      <AIChat
        title="Travel AI Assistant"
        placeholder="Ask for travel tips, best times to book..."
        quickAsks={[
          "Best time to book flights?",
          "Tips for long-haul travel",
          "How does travel sniping work?",
        ]}
        systemContext="You are a travel expert assistant for AgentHub's Flight & Hotel Finder, which integrates with Ticket Sniper Bot for automated price monitoring and booking."
      />

      {snipeFlight && (
        <SnipeModal
          title="Flight Sniper"
          subtitle={`${snipeFlight.airline} · ${snipeFlight.from} → ${snipeFlight.to}`}
          price={snipeFlight.price}
          bookingUrl={snipeFlight.bookingUrl}
          disabled={snipeFlight.availability === "sold-out"}
          quantityLabel="Passengers"
          quantityDefault={1}
          priorityZonesDefault={snipeFlight.class}
          infoText="monitors fare drops and seat availability, then auto-books your flight."
          eventName={`${snipeFlight.airline} ${snipeFlight.from}→${snipeFlight.to}`}
          buildPayload={(userId, options) =>
            flightToHuntPayload(snipeFlight, userId, options)
          }
          onClose={() => setSnipeFlight(null)}
          onHuntStarted={onHuntStarted}
        />
      )}

      {snipeHotel && (
        <SnipeModal
          title="Hotel Sniper"
          subtitle={`${snipeHotel.name} · ${snipeHotel.city}`}
          price={snipeHotel.pricePerNight}
          bookingUrl={snipeHotel.bookingUrl}
          disabled={snipeHotel.availability === "sold-out"}
          quantityLabel="Nights"
          quantityDefault={3}
          priorityZonesDefault={snipeHotel.amenities.slice(0, 3).join(", ")}
          infoText="watches room rates and availability, then auto-books your stay."
          eventName={`${snipeHotel.name} · ${snipeHotel.city}`}
          buildPayload={(userId, options) =>
            hotelToHuntPayload(snipeHotel, userId, {
              ...options,
              nights: options.quantity,
            })
          }
          onClose={() => setSnipeHotel(null)}
          onHuntStarted={onHuntStarted}
        />
      )}

      {snipeBundle && (
        <SnipeModal
          title="Bundle Sniper"
          subtitle={`${snipeBundle.flight.from} → ${snipeBundle.flight.to} + ${snipeBundle.hotel.name}`}
          price={snipeBundle.total}
          bookingUrl={snipeBundle.flight.bookingUrl}
          disabled={
            snipeBundle.flight.availability === "sold-out" ||
            snipeBundle.hotel.availability === "sold-out"
          }
          quantityLabel="Travelers"
          quantityDefault={1}
          priorityZonesDefault={`${snipeBundle.flight.class}, ${snipeBundle.hotel.city}`}
          infoText="monitors flight + hotel bundle pricing and auto-books when your target is met."
          eventName={`Bundle: ${snipeBundle.flight.from}→${snipeBundle.flight.to}`}
          buildPayload={(userId, options) =>
            bundleToHuntPayload(
              snipeBundle.flight,
              snipeBundle.hotel,
              userId,
              options
            )
          }
          onClose={() => setSnipeBundle(null)}
          onHuntStarted={onHuntStarted}
        />
      )}
    </div>
  );
}
