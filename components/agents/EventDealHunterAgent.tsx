"use client";

import { useState, useMemo } from "react";
import { eventDeals, dealCategories, formatDealEnds } from "@/lib/data/eventDeals";
import { EventDeal } from "@/lib/types";
import { dealToHuntPayload } from "@/lib/ticket-sniper/payloads";
import ResultCard from "@/components/ui/ResultCard";
import AIChat, { useAIResponse } from "@/components/ui/AIChat";
import StatusBar from "@/components/ui/StatusBar";
import SniperBanner from "@/components/sniper/SniperBanner";
import SnipeSuccess from "@/components/sniper/SnipeSuccess";
import HuntStatusPanel from "@/components/sniper/HuntStatusPanel";
import SnipeModal from "@/components/sniper/SnipeModal";
import { useSniperState } from "@/components/sniper/useSniperState";

export default function EventDealHunterAgent() {
  const [category, setCategory] = useState("All");
  const [flashOnly, setFlashOnly] = useState(true);
  const [maxPrice, setMaxPrice] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [snipeDeal, setSnipeDeal] = useState<EventDeal | null>(null);
  const { huntRefreshKey, snipeSuccess, onHuntStarted } = useSniperState();
  const { response, isLoading, ask } = useAIResponse();

  const filtered = useMemo(() => {
    return eventDeals
      .filter((d) => {
        if (flashOnly && !d.flashSale) return false;
        if (category !== "All" && d.category !== category) return false;
        if (maxPrice && d.salePrice > Number(maxPrice)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
      );
  }, [category, flashOnly, maxPrice]);

  return (
    <div className="space-y-6">
      <SniperBanner
        accent="coral"
        description={
          <>
            Click <strong>Snipe Deal</strong> to monitor flash sale drops,
            restocks, and price cuts — auto-checkout via Ticket Sniper Bot when
            your target price hits.
          </>
        }
      />

      {snipeSuccess && <SnipeSuccess message={snipeSuccess} />}
      <HuntStatusPanel refreshKey={huntRefreshKey} />

      <div className="glass-panel p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-modern"
          >
            {dealCategories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Max price ($)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-modern"
          />
          <label className="flex items-center gap-2 text-sm text-hub-teal px-2">
            <input
              type="checkbox"
              checked={flashOnly}
              onChange={(e) => setFlashOnly(e.target.checked)}
            />
            Flash sales only
          </label>
          <button
            onClick={() => {
              setIsSearching(true);
              setTimeout(() => setIsSearching(false), 400);
            }}
            className="btn-primary"
          >
            Hunt Deals
          </button>
        </div>
        <StatusBar
          status={isSearching ? "thinking" : "idle"}
          message={`${filtered.length} hunt targets`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d) => (
          <ResultCard
            key={d.id}
            icon="🎯"
            title={d.title}
            subtitle={`${d.merchant} · ${d.discount}% off`}
            price={`$${d.salePrice}`}
            meta={[
              d.category,
              d.flashSale ? "⚡ Flash" : "Deal",
              `Drop ends ${formatDealEnds(d.endsAt)}`,
              `$${d.originalPrice} MSRP`,
            ]}
            availability={d.availability}
            actionLabel="Snipe Deal"
            onAction={() => setSnipeDeal(d)}
            allowActionWhenSoldOut
            onDetails={() =>
              ask(
                `Should I snipe ${d.title}? Sale price $${d.salePrice}, ${d.discount}% off, ends ${formatDealEnds(d.endsAt)}.`
              )
            }
            onAlternatives={() =>
              ask(
                `What similar ${d.category} deals are dropping soon under $${d.salePrice}?`
              )
            }
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">No hunt targets match your filters.</div>
      )}

      {response && (
        <div className="glass-panel p-5">
          <StatusBar status={isLoading ? "thinking" : "idle"} />
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mt-2">
            {response}
          </p>
        </div>
      )}

      <AIChat
        title="Deal Hunter AI"
        placeholder="Ask about sniping strategies..."
        quickAsks={[
          "Best flash sale to snipe today?",
          "How to set price alerts?",
          "Tips for ticket presale sniping",
        ]}
        systemContext="You are a flash sale and deal sniping expert for AgentHub's Event Deal Hunter, which uses Ticket Sniper Bot to monitor drops and auto-purchase at target prices."
      />

      {snipeDeal && (
        <SnipeModal
          title="Deal Sniper"
          subtitle={`${snipeDeal.title} · ${snipeDeal.merchant}`}
          price={snipeDeal.salePrice}
          bookingUrl={snipeDeal.dealUrl}
          platform={snipeDeal.platform}
          quantityLabel="Quantity"
          quantityDefault={1}
          priorityZonesDefault={`${snipeDeal.category}, max $${snipeDeal.salePrice}`}
          infoText="Monitors deal pages for price drops, restocks, and checkout windows."
          eventName={snipeDeal.title}
          buildPayload={(userId, options) =>
            dealToHuntPayload(snipeDeal, userId, options)
          }
          onClose={() => setSnipeDeal(null)}
          onHuntStarted={onHuntStarted}
        />
      )}
    </div>
  );
}
