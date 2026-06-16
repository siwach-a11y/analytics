"use client";

import { useState, useMemo } from "react";
import { eventDeals, dealCategories, formatDealEnds } from "@/lib/data/eventDeals";
import TabSwitcher from "@/components/ui/TabSwitcher";
import ResultCard from "@/components/ui/ResultCard";
import AIChat, { useAIResponse } from "@/components/ui/AIChat";
import StatusBar from "@/components/ui/StatusBar";

const tabs = [
  { id: "all", label: "All Deals" },
  { id: "flash", label: "Flash Sales" },
  { id: "ending", label: "Ending Soon" },
];

export default function EventDealFlashSaleAgent() {
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("");
  const [minDiscount, setMinDiscount] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { response, isLoading, ask } = useAIResponse();

  const filtered = useMemo(() => {
    const now = Date.now();
    const base =
      activeTab === "flash"
        ? eventDeals.filter((d) => d.flashSale)
        : activeTab === "ending"
          ? [...eventDeals].sort(
              (a, b) =>
                new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
            )
          : eventDeals;

    return base.filter((d) => {
      if (category !== "All" && d.category !== category) return false;
      if (city && d.city && !d.city.toLowerCase().includes(city.toLowerCase()))
        return false;
      if (minDiscount && d.discount < Number(minDiscount)) return false;
      if (activeTab === "ending") {
        const hoursLeft =
          (new Date(d.endsAt).getTime() - now) / (1000 * 60 * 60);
        if (hoursLeft > 48 || hoursLeft < 0) return false;
      }
      return true;
    });
  }, [category, city, minDiscount, activeTab]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-3.5 text-sm text-hub-teal bg-white/90 border border-white shadow-sm">
        Browse live flash sales and event deals. For automated deal-drop
        monitoring, use the <strong>Event Deal Hunter</strong> agent.
      </div>

      <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

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
            type="text"
            placeholder="City (optional)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-modern"
          />
          <input
            type="number"
            placeholder="Min discount %"
            value={minDiscount}
            onChange={(e) => setMinDiscount(e.target.value)}
            className="input-modern"
          />
          <button
            onClick={() => {
              setIsSearching(true);
              setTimeout(() => setIsSearching(false), 400);
            }}
            className="btn-primary"
          >
            Find Deals
          </button>
        </div>
        <StatusBar
          status={isSearching ? "thinking" : "idle"}
          message={`${filtered.length} deals found`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((d) => (
          <ResultCard
            key={d.id}
            icon={d.flashSale ? "⚡" : "🏷️"}
            title={d.title}
            subtitle={`${d.merchant}${d.city ? ` · ${d.city}` : ""}`}
            price={`$${d.salePrice}`}
            meta={[
              d.discount ? `${d.discount}% off` : "Presale",
              d.category,
              d.flashSale ? "Flash Sale" : "Deal",
              `Ends ${formatDealEnds(d.endsAt)}`,
            ]}
            availability={d.availability}
            actionLabel="View Deal"
            onAction={() => window.open(d.dealUrl, "_blank")}
            onDetails={() =>
              ask(
                `Is ${d.title} from ${d.merchant} a good deal? ${d.discount}% off, was $${d.originalPrice}, now $${d.salePrice}. Ends ${formatDealEnds(d.endsAt)}.`
              )
            }
            onAlternatives={() =>
              ask(
                `Find similar ${d.category} deals${d.city ? ` in ${d.city}` : ""} with at least ${d.discount}% off.`
              )
            }
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">No deals match your filters.</div>
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
        title="Deals AI Assistant"
        placeholder="Ask about flash sales and price comparisons..."
        quickAsks={[
          "Best electronics flash sales today?",
          "Is the Sony XM5 deal worth it?",
          "Travel deals ending this week?",
        ]}
        systemContext="You are a deal-hunting expert for AgentHub's Event Deal & Flash Sale Agent, helping users find the best discounts across electronics, travel, tickets, and more."
      />
    </div>
  );
}
