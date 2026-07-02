"use client";

import { useEffect, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/giftcard/countries";
import { CATEGORIES, POPULAR_BRANDS, TRENDING_SEARCHES } from "@/lib/giftcard/categories";
import { searchGiftCardsAndCoupons } from "@/lib/giftcard/searchClient";
import { rankGiftCards, rankCoupons, type GiftCardSort, type CouponSort } from "@/lib/giftcard/rank";
import { SearchResults } from "@/lib/giftcard/types";
import { MISSING_KEY_ERROR } from "@/lib/anthropicKey";
import KeyManager from "@/components/ui/KeyManager";
import GiftCardCard from "@/components/giftcard/GiftCardCard";
import CouponCard from "@/components/giftcard/CouponCard";

const RECENT_KEY = "giftcard_recent";
type Mode = "all" | "giftcards" | "coupons";

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState<Mode>("all");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needKey, setNeedKey] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  // filters / sort
  const [officialOnly, setOfficialOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [gcSort, setGcSort] = useState<GiftCardSort>("best");
  const [cpSort, setCpSort] = useState<CouponSort>("best");

  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      if (Array.isArray(r)) setRecent(r.slice(0, 6));
    } catch {
      /* ignore */
    }
  }, []);

  const pushRecent = (q: string) => {
    if (!q.trim()) return;
    setRecent((prev) => {
      const next = [q, ...prev.filter((x) => x !== q)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const runSearch = async (opts?: { query?: string; brand?: string }) => {
    const q = opts?.query ?? query;
    setLoading(true);
    setError(null);
    setNeedKey(false);
    if (opts?.query !== undefined) setQuery(opts.query);
    try {
      const res = await searchGiftCardsAndCoupons({
        query: q,
        country,
        category: category === "all" ? undefined : category,
        brand: opts?.brand,
        mode,
      });
      setResults(res);
      pushRecent(q || (opts?.brand ?? ""));
    } catch (e) {
      if (e instanceof Error && e.name === MISSING_KEY_ERROR) setNeedKey(true);
      else setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const giftCards = results
    ? rankGiftCards(
        officialOnly ? results.giftCards.filter((g) => g.sourceType === "official") : results.giftCards,
        gcSort
      )
    : [];
  const coupons = results
    ? rankCoupons(
        verifiedOnly ? results.coupons.filter((c) => c.verified) : results.coupons,
        cpSort
      )
    : [];

  const showGc = mode !== "coupons";
  const showCp = mode !== "giftcards";

  return (
    <div className="page-bg min-h-screen">
      {/* Top bar */}
      <header className="glass-nav">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center gap-3">
          <div className="icon-box w-9 h-9 text-base">🎁</div>
          <div>
            <h1 className="font-bold tracking-tight text-white text-sm">Voucher Agent</h1>
            <p className="text-[10px] uppercase tracking-widest text-violet-400">Gift Card &amp; Coupon AI Search</p>
          </div>
          <a href="/" className="ml-auto text-xs text-violet-400 hover:text-violet-300">← Marketplace</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10">
        {/* Hero + search */}
        <div className="text-center mb-6">
          <h2 className="heading-lg">
            Find <span className="gradient-text">gift cards &amp; coupons</span> anywhere
          </h2>
          <p className="mt-2 text-slate-400 text-sm">
            AI search across Sri Lanka, Indonesia, Bangladesh, Vietnam, Myanmar, Ethiopia &amp; Nigeria.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
          className="glass-panel p-2 flex flex-col sm:flex-row items-stretch gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g. "Steam gift card Indonesia" or "Foodpanda promo Bangladesh"'
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 px-3 py-2 focus:outline-none focus:border-violet-400/50"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
          <button type="submit" disabled={loading} className="btn-primary !px-6 !py-3">
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {/* Mode + category */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["all", "giftcards", "coupons"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`chip-filter ${mode === m ? "chip-filter-active" : "chip-filter-inactive"}`}
            >
              {m === "all" ? "All" : m === "giftcards" ? "Gift Cards" : "Coupons"}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/10" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 px-3 py-1.5 focus:outline-none focus:border-violet-400/50"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (<option key={c.key} value={c.key}>{c.icon} {c.key}</option>))}
          </select>
        </div>

        {needKey && (
          <div className="mt-5 max-w-lg">
            <KeyManager />
            <p className="mt-2 text-xs text-slate-500">Add your Anthropic key to run AI search on this static demo, then search again.</p>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

        {/* Pre-search suggestions */}
        {!results && !loading && (
          <div className="mt-8 space-y-6">
            <div>
              <p className="section-title mb-2">Trending searches</p>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((t) => (
                  <button key={t} onClick={() => runSearch({ query: t })} className="chip chip-inactive !py-1.5 !text-xs">
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="section-title mb-2">Popular brands</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_BRANDS.map((b) => (
                  <button key={b} onClick={() => runSearch({ brand: b, query: `${b} gift card` })} className="chip chip-inactive !py-1.5 !text-xs">
                    {b}
                  </button>
                ))}
              </div>
            </div>
            {recent.length > 0 && (
              <div>
                <p className="section-title mb-2">Recent searches</p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button key={r} onClick={() => runSearch({ query: r })} className="chip chip-inactive !py-1.5 !text-xs">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-10 text-center text-sm text-slate-400">
            <span className="inline-block w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin align-middle mr-2" />
            Searching trusted sources across the web…
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="mt-8 space-y-10">
            {showGc && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    Gift Cards <span className="text-sm font-normal text-slate-500">{giftCards.length}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-400">
                      <input type="checkbox" checked={officialOnly} onChange={(e) => setOfficialOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500" />
                      Official only
                    </label>
                    <select value={gcSort} onChange={(e) => setGcSort(e.target.value as GiftCardSort)} className="rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 px-2 py-1 focus:outline-none">
                      <option value="best">Best match</option>
                      <option value="trust">Highest trust</option>
                      <option value="price">Lowest price</option>
                    </select>
                  </div>
                </div>
                {giftCards.length === 0 ? (
                  <p className="empty-state">No gift cards found. Try a brand or different country.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {giftCards.map((g) => (<GiftCardCard key={g.id} card={g} />))}
                  </div>
                )}
              </section>
            )}

            {showCp && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    Coupons <span className="text-sm font-normal text-slate-500">{coupons.length}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-400">
                      <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500" />
                      Verified only
                    </label>
                    <select value={cpSort} onChange={(e) => setCpSort(e.target.value as CouponSort)} className="rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 px-2 py-1 focus:outline-none">
                      <option value="best">Best match</option>
                      <option value="trust">Highest trust</option>
                      <option value="discount">Highest discount</option>
                    </select>
                  </div>
                </div>
                {coupons.length === 0 ? (
                  <p className="empty-state">No coupons found. Try a merchant or different country.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map((c) => (<CouponCard key={c.id} coupon={c} />))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
