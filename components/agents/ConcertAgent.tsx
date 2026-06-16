"use client";

import { useState, useMemo } from "react";
import { concerts, genres } from "@/lib/data/concerts";
import { Concert } from "@/lib/types";
import { concertToHuntPayload } from "@/lib/ticket-sniper/payloads";
import ResultCard from "@/components/ui/ResultCard";
import AIChat, { useAIResponse } from "@/components/ui/AIChat";
import StatusBar from "@/components/ui/StatusBar";
import SniperBanner from "@/components/sniper/SniperBanner";
import SnipeSuccess from "@/components/sniper/SnipeSuccess";
import HuntStatusPanel from "@/components/sniper/HuntStatusPanel";
import SnipeModal from "@/components/sniper/SnipeModal";
import { useSniperState } from "@/components/sniper/useSniperState";

export default function ConcertAgent() {
  const [artist, setArtist] = useState("");
  const [city, setCity] = useState("");
  const [month, setMonth] = useState("");
  const [genre, setGenre] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [snipeConcert, setSnipeConcert] = useState<Concert | null>(null);
  const { huntRefreshKey, snipeSuccess, onHuntStarted } = useSniperState();
  const { response, isLoading, ask } = useAIResponse();

  const filtered = useMemo(() => {
    return concerts.filter((c) => {
      if (artist && !c.artist.toLowerCase().includes(artist.toLowerCase()))
        return false;
      if (city && !c.city.toLowerCase().includes(city.toLowerCase()))
        return false;
      if (month && !c.month.toLowerCase().includes(month.toLowerCase()))
        return false;
      if (genre !== "All" && c.genre !== genre) return false;
      return true;
    });
  }, [artist, city, month, genre]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 400);
  };

  const handleDetails = (concert: Concert) => {
    ask(
      `Tell me about the upcoming ${concert.artist} concert at ${concert.venue} in ${concert.city} on ${concert.date}. Include venue info, what to expect, and tips for attendees.`
    );
  };

  const handleAlternatives = (concert: Concert) => {
    ask(
      `Suggest alternative concerts similar to ${concert.artist} (${concert.genre}) in ${concert.city} or nearby cities around ${concert.month} 2026.`
    );
  };

  return (
    <div className="space-y-6">
      <SniperBanner
        description={
          <>
            Click <strong>Snipe Tickets</strong> on any concert to launch
            automated queue entry, seat scanning, and auto-reserve via the
            Ticket Sniper Bot backend.
          </>
        }
      />

      {snipeSuccess && <SnipeSuccess message={snipeSuccess} />}

      <HuntStatusPanel refreshKey={huntRefreshKey} />

      <div className="glass-panel p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="input-modern"
          />
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-modern"
          />
          <input
            type="text"
            placeholder="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input-modern"
          />
          <button onClick={handleSearch} className="btn-primary">
            Search Concerts
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`chip-filter ${genre === g ? "chip-filter-active" : "chip-filter-inactive"}`}
            >
              {g}
            </button>
          ))}
        </div>

        <StatusBar
          status={isSearching ? "thinking" : "idle"}
          message={`${filtered.length} concerts found`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <ResultCard
            key={c.id}
            icon="🎵"
            title={c.artist}
            subtitle={`${c.venue} · ${c.city} · ${c.date}`}
            price={`$${c.price}`}
            meta={[c.genre, c.month, c.platform]}
            availability={c.availability}
            actionLabel="Snipe Tickets"
            onAction={() => setSnipeConcert(c)}
            onDetails={() => handleDetails(c)}
            onAlternatives={() => handleAlternatives(c)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          No concerts match your filters. Try broadening your search.
        </div>
      )}

      {response && (
        <div className="glass-panel p-5 border-hub-purple/15 bg-hub-purple-light/30">
          <div className="flex items-center gap-2 mb-2">
            <StatusBar status={isLoading ? "thinking" : "idle"} />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {response}
          </p>
        </div>
      )}

      <AIChat
        title="Concert AI Assistant"
        placeholder="Ask about concerts, venues, or artists..."
        quickAsks={[
          "Best concerts this summer?",
          "Cheap tickets in NYC",
          "How does Ticket Sniper work?",
        ]}
        systemContext="You are a concert and live music expert assistant for AgentHub's Concert Ticket Finder, which integrates with Ticket Sniper Bot for automated ticket hunting."
      />

      {snipeConcert && (
        <SnipeModal
          title="Ticket Sniper"
          subtitle={`${snipeConcert.artist} · ${snipeConcert.venue}`}
          price={snipeConcert.price}
          bookingUrl={snipeConcert.ticketUrl}
          platform={snipeConcert.platform}
          disabled={snipeConcert.availability === "sold-out"}
          quantityDefault={2}
          priorityZonesDefault="GA, Floor, VIP"
          showMaxRow
          showAdjacent
          eventName={snipeConcert.artist}
          buildPayload={(userId, options) =>
            concertToHuntPayload(snipeConcert, userId, options)
          }
          onClose={() => setSnipeConcert(null)}
          onHuntStarted={onHuntStarted}
        />
      )}
    </div>
  );
}
