"use client";

import { useState, useMemo } from "react";
import { agents, getFeaturedAgents, getMarketplaceStats } from "@/lib/data/agents";
import Sidebar from "@/components/marketplace/Sidebar";
import Hero from "@/components/marketplace/Hero";
import StatsBar from "@/components/marketplace/StatsBar";
import CategoryTiles from "@/components/marketplace/CategoryTiles";
import AgentCard from "@/components/marketplace/AgentCard";
import AgentListItem from "@/components/marketplace/AgentListItem";
import Footer from "@/components/marketplace/Footer";
import MarketplaceChat from "@/components/marketplace/MarketplaceChat";
import PublishedOffers from "@/components/marketplace/PublishedOffers";

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <p className="section-title mb-1">{eyebrow}</p>
        <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
      </div>
      <span className="text-xs font-medium text-violet-400 hover:text-violet-300 cursor-pointer">
        View All →
      </span>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const stats = getMarketplaceStats();
  const featured = getFeaturedAgents();

  const filtered = useMemo(() => {
    if (!search) return agents;
    const q = search.toLowerCase();
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.author.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="page-bg min-h-screen">
      <Sidebar />

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="glass-nav">
          <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center gap-2 lg:hidden shrink-0">
              <div className="icon-box w-9 h-9 text-base">🎟️</div>
              <span className="font-bold text-white text-sm">AgentHub</span>
            </div>
            <div className="flex-1 max-w-md relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-modern pl-10 rounded-full"
              />
            </div>
            <button className="ml-auto relative w-10 h-10 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-fuchsia-500 ring-2 ring-[#0a0713]" />
            </button>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8 space-y-14 max-w-6xl">
          <Hero />

          <StatsBar totalAgents={stats.totalAgents} monthlyUsers={stats.monthlyUsers} />

          {!search && (
            <section id="categories">
              <SectionHeader eyebrow="Browse by type" title="Categories" />
              <CategoryTiles />
            </section>
          )}

          {!search && <PublishedOffers />}

          {!search && (
            <section id="featured">
              <SectionHeader eyebrow="Curated picks" title="Featured Agents" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featured.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} featured />
                ))}
              </div>
            </section>
          )}

          <section id="all">
            <SectionHeader
              eyebrow="Full catalog"
              title={search ? `Search Results (${filtered.length})` : "All Agents"}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((agent) => (
                <AgentListItem key={agent.id} agent={agent} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="empty-state">
                No agents match your search. Try different keywords.
              </div>
            )}
          </section>

          <Footer />
        </main>
      </div>

      <MarketplaceChat />
    </div>
  );
}
