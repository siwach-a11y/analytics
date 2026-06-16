"use client";

import { useState, useMemo } from "react";
import { cars } from "@/lib/data/cars";
import { CarRental } from "@/lib/types";
import { carToHuntPayload } from "@/lib/ticket-sniper/payloads";
import ResultCard from "@/components/ui/ResultCard";
import AIChat, { useAIResponse } from "@/components/ui/AIChat";
import StatusBar from "@/components/ui/StatusBar";
import SniperBanner from "@/components/sniper/SniperBanner";
import SnipeSuccess from "@/components/sniper/SnipeSuccess";
import HuntStatusPanel from "@/components/sniper/HuntStatusPanel";
import SnipeModal from "@/components/sniper/SnipeModal";
import { useSniperState } from "@/components/sniper/useSniperState";

export default function CarRentalAgent() {
  const [city, setCity] = useState("");
  const [carType, setCarType] = useState("All");
  const [transmission, setTransmission] = useState("All");
  const [maxBudget, setMaxBudget] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [snipeCar, setSnipeCar] = useState<CarRental | null>(null);
  const { huntRefreshKey, snipeSuccess, onHuntStarted } = useSniperState();
  const { response, isLoading, ask } = useAIResponse();

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      if (city && !c.city.toLowerCase().includes(city.toLowerCase()))
        return false;
      if (carType !== "All" && c.type !== carType) return false;
      if (transmission !== "All" && c.transmission !== transmission)
        return false;
      if (maxBudget && c.pricePerDay > Number(maxBudget)) return false;
      return true;
    });
  }, [city, carType, transmission, maxBudget]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 400);
  };

  return (
    <div className="space-y-6">
      <SniperBanner
        accent="blue"
        description={
          <>
            Click <strong>Snipe Rental</strong> on any vehicle to watch daily
            rates and availability, then auto-reserve via Ticket Sniper Bot.
          </>
        }
      />

      {snipeSuccess && <SnipeSuccess message={snipeSuccess} />}

      <HuntStatusPanel refreshKey={huntRefreshKey} />

      <div className="glass-panel p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-modern"
          />
          <select
            value={carType}
            onChange={(e) => setCarType(e.target.value)}
            className="input-modern"
          >
            <option value="All">All Types</option>
            <option value="Economy">Economy</option>
            <option value="SUV">SUV</option>
            <option value="Luxury">Luxury</option>
            <option value="Van">Van</option>
            <option value="Convertible">Convertible</option>
          </select>
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            className="input-modern"
          >
            <option value="All">All Transmissions</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
          <input
            type="number"
            placeholder="Max $/day"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            className="input-modern"
          />
        </div>

        <button onClick={handleSearch} className="btn-primary">
          Search Rentals
        </button>

        <StatusBar
          status={isSearching ? "thinking" : "idle"}
          message={`${filtered.length} vehicles found`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <ResultCard
            key={c.id}
            icon="🚗"
            title={`${c.company} — ${c.model}`}
            subtitle={`${c.city} · ${c.type} · ${c.transmission}`}
            price={`$${c.pricePerDay}/day`}
            meta={c.features}
            availability={c.availability}
            actionLabel="Snipe Rental"
            onAction={() => setSnipeCar(c)}
            onDetails={() =>
              ask(
                `Tell me about renting a ${c.model} (${c.type}) from ${c.company} in ${c.city} at $${c.pricePerDay}/day. Features: ${c.features.join(", ")}. Include insurance tips and driving advice.`
              )
            }
            onAlternatives={() =>
              ask(
                `Suggest cheaper alternatives to the ${c.model} (${c.type}, ${c.transmission}) in ${c.city} under $${c.pricePerDay}/day.`
              )
            }
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">No vehicles match your filters.</div>
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
        title="Rental AI Assistant"
        placeholder="Ask about car rentals, insurance, road trips..."
        quickAsks={[
          "Do I need rental insurance?",
          "Best car for a road trip?",
          "How does rental sniping work?",
        ]}
        systemContext="You are a car rental expert for AgentHub's Car Rental Finder, which integrates with Ticket Sniper Bot for automated rate monitoring and reservations."
      />

      {snipeCar && (
        <SnipeModal
          title="Rental Sniper"
          subtitle={`${snipeCar.company} ${snipeCar.model} · ${snipeCar.city}`}
          price={snipeCar.pricePerDay}
          bookingUrl={snipeCar.bookingUrl}
          disabled={snipeCar.availability === "sold-out"}
          quantityLabel="Days"
          quantityDefault={3}
          priorityZonesDefault={`${snipeCar.type}, ${snipeCar.transmission}`}
          infoText="tracks daily rental rates and fleet availability, then auto-reserves your vehicle."
          eventName={`${snipeCar.company} ${snipeCar.model}`}
          buildPayload={(userId, options) =>
            carToHuntPayload(snipeCar, userId, {
              ...options,
              days: options.quantity,
            })
          }
          onClose={() => setSnipeCar(null)}
          onHuntStarted={onHuntStarted}
        />
      )}
    </div>
  );
}
