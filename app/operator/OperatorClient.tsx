"use client";

import { useCallback, useEffect, useState } from "react";
import { DiscoveredOffer } from "@/lib/pipeline/types";
import { QueueAction } from "@/lib/pipeline/offerStatus";
import { DISCOVERY_PROFILES } from "@/lib/pipeline/profiles";
import { rewardCategories } from "@/lib/data/rewards";
import {
  actOnOffer,
  fetchQueue,
  runDiscovery,
  setOperatorKey,
} from "@/lib/pipeline/client";
import OfferQueueTable from "@/components/operator/OfferQueueTable";

const REWARD_TYPES = Object.values(DISCOVERY_PROFILES);
const CATEGORIES = rewardCategories.filter((c) => c !== "All");
const COUNTRIES = [
  ["US", "🇺🇸 United States"],
  ["GB", "🇬🇧 United Kingdom"],
  ["TH", "🇹🇭 Thailand"],
  ["SG", "🇸🇬 Singapore"],
  ["MY", "🇲🇾 Malaysia"],
  ["IN", "🇮🇳 India"],
] as const;

export default function OperatorClient() {
  const [needKey, setNeedKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const [offers, setOffers] = useState<DiscoveredOffer[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rewardType, setRewardType] = useState(REWARD_TYPES[0].rewardType);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [country, setCountry] = useState("US");
  const [discovering, setDiscovering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchQueue();
      setOffers(res.offers);
      setCounts(res.counts);
      setNeedKey(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.toLowerCase().includes("unauthorized")) setNeedKey(true);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveKey = () => {
    setOperatorKey(keyDraft);
    setKeyDraft("");
    load();
  };

  const onAction = async (id: string, action: QueueAction) => {
    setBusy(true);
    try {
      await actOnOffer(id, action);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const onBulk = async (ids: string[], action: QueueAction) => {
    setBusy(true);
    try {
      await Promise.all(ids.map((id) => actOnOffer(id, action).catch(() => null)));
      await load();
    } finally {
      setBusy(false);
    }
  };

  const onDiscover = async () => {
    setDiscovering(true);
    setToast(null);
    setError(null);
    try {
      const res = await runDiscovery({ rewardType, category, country });
      setToast(`Discovered ${res.discovered} · added ${res.added} · skipped ${res.skipped} (dupes)`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Discovery failed");
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div className="page-bg min-h-screen">
      <header className="glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="icon-box w-9 h-9 text-base">🛠️</div>
          <div>
            <h1 className="font-semibold tracking-tight text-white">Operator — Offer Queue</h1>
            <p className="text-xs text-slate-500">Discover → Review → Approve → Publish</p>
          </div>
          <a href="/" className="ml-auto text-xs text-violet-400 hover:text-violet-300">← Marketplace</a>
        </div>
      </header>

      {needKey ? (
        <div className="max-w-md mx-auto mt-24 glass-panel p-6 space-y-3">
          <h2 className="font-semibold text-white">Operator access</h2>
          <p className="text-xs text-slate-400">
            Enter the operator passphrase (OPERATOR_PASSPHRASE) to manage the queue.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveKey()}
              placeholder="passphrase"
              className="input-modern flex-1"
            />
            <button onClick={saveKey} className="btn-primary">Enter</button>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* Discovery trigger */}
          <section className="glass-panel p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Run discovery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select value={rewardType} onChange={(e) => setRewardType(e.target.value as typeof rewardType)} className="input-modern">
                {REWARD_TYPES.map((p) => (
                  <option key={p.rewardType} value={p.rewardType}>{p.label}</option>
                ))}
              </select>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-modern">
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-modern">
                {COUNTRIES.map(([code, label]) => (<option key={code} value={code}>{label}</option>))}
              </select>
              <button onClick={onDiscover} disabled={discovering} className="btn-primary">
                {discovering ? "Discovering…" : "Discover offers"}
              </button>
            </div>
            {toast && <p className="mt-3 text-xs text-emerald-300">{toast}</p>}
            {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
          </section>

          <OfferQueueTable
            offers={offers}
            counts={counts}
            loading={loading}
            busy={busy}
            onAction={onAction}
            onBulk={onBulk}
            onRefresh={load}
          />
        </main>
      )}
    </div>
  );
}
