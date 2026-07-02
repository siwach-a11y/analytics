"use client";

import { useMemo, useState } from "react";
import { DiscoveredOffer, PipelineStatus } from "@/lib/pipeline/types";
import { DISCOVERY_PROFILES } from "@/lib/pipeline/profiles";
import { queueUi } from "@/lib/pipeline/queueTheme";
import {
  ALL_STATUSES,
  QueueAction,
  canApprove,
  canPublish,
  canReject,
  isSelectableForBulk,
  rowStateClass,
  statusBadgeClass,
  statusLabel,
} from "@/lib/pipeline/offerStatus";
import QueueHealthDropdown from "./QueueHealthDropdown";
import OfferRowActions from "./OfferRowActions";
import OfferDetailModal from "./OfferDetailModal";

const SUMMARY: { status: PipelineStatus; num: string }[] = [
  { status: "pending_approval", num: "text-amber-300" },
  { status: "approved", num: "text-sky-300" },
  { status: "published", num: "text-emerald-300" },
  { status: "rejected", num: "text-rose-300" },
];

interface Props {
  offers: DiscoveredOffer[];
  counts: Record<string, number>;
  loading: boolean;
  busy: boolean;
  onAction: (id: string, action: QueueAction) => void;
  onBulk: (ids: string[], action: QueueAction) => void;
  onRefresh: () => void;
}

export default function OfferQueueTable({
  offers,
  counts,
  loading,
  busy,
  onAction,
  onBulk,
  onRefresh,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<"all" | PipelineStatus>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [country, setCountry] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<DiscoveredOffer | null>(null);

  const countries = useMemo(
    () => Array.from(new Set(offers.map((o) => o.country))).sort(),
    [offers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return offers.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (typeFilter !== "all" && o.rewardType !== typeFilter) return false;
      if (country !== "all" && o.country !== country) return false;
      if (q && !`${o.title} ${o.merchant}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [offers, statusFilter, typeFilter, country, search]);

  const selectableIds = filtered.filter((o) => isSelectableForBulk(o.status)).map((o) => o.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(selectableIds));

  const runBulk = (action: QueueAction) => {
    const ok =
      action === "approve" ? canApprove : action === "reject" ? canReject : canPublish;
    const ids = offers
      .filter((o) => selected.has(o.id) && ok(o.status))
      .map((o) => o.id);
    if (ids.length) onBulk(ids, action);
    setSelected(new Set());
  };

  return (
    <div className={queueUi.outerShell}>
      {/* Summary bar */}
      <div className={queueUi.summaryBar}>
        {SUMMARY.map((s, i) => (
          <div key={s.status} className="flex items-center gap-6">
            {i > 0 && <span className={queueUi.summarySep} />}
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-bold tabular-nums ${s.num}`}>
                {counts[s.status] ?? 0}
              </span>
              <span className={queueUi.summaryLabel}>{statusLabel(s.status)}</span>
            </div>
          </div>
        ))}
        <button onClick={onRefresh} className={`ml-auto ${queueUi.btnGhost}`}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Filter bar */}
      <div className={queueUi.filterBar}>
        <div className="flex items-center">
          <span className={queueUi.selectLabel}>Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | PipelineStatus)}
            className={queueUi.selectControl}
          >
            <option value="all">All</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <span className={queueUi.selectLabel}>Type</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={queueUi.selectControl}>
            <option value="all">All</option>
            {Object.values(DISCOVERY_PROFILES).map((p) => (
              <option key={p.rewardType} value={p.rewardType}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center">
          <span className={queueUi.selectLabel}>Region</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={queueUi.selectControl}>
            <option value="all">All</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or merchant…"
          className={`${queueUi.inputSm} flex-1 min-w-[160px]`}
        />
        <div className="flex items-center gap-1.5">
          <span className={queueUi.selectLabel}>Queue</span>
          <QueueHealthDropdown counts={counts} />
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className={queueUi.bulkBar}>
          <span className="text-sm text-white font-medium">{selected.size} selected</span>
          <button disabled={busy} onClick={() => runBulk("approve")} className={queueUi.btnApprove}>Approve</button>
          <button disabled={busy} onClick={() => runBulk("publish")} className={queueUi.btnPublish}>Publish</button>
          <button disabled={busy} onClick={() => runBulk("reject")} className={queueUi.btnReject}>Reject</button>
          <button onClick={() => setSelected(new Set())} className={`ml-auto ${queueUi.btnGhost}`}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className={queueUi.tableScrollArea}>
        {loading ? (
          <div className={queueUi.emptyBox}>Loading queue…</div>
        ) : filtered.length === 0 ? (
          <div className={queueUi.emptyBox}>
            No offers match these filters. Run discovery to populate the queue.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className={queueUi.tableStickyHead}>
              <tr>
                <th className={`${queueUi.th} w-8`}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={selectableIds.length === 0}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                  />
                </th>
                <th className={queueUi.th}>Offer</th>
                <th className={queueUi.th}>Type</th>
                <th className={queueUi.th}>Value</th>
                <th className={queueUi.th}>Region</th>
                <th className={queueUi.th}>Score</th>
                <th className={queueUi.th}>Discovered</th>
                <th className={queueUi.th}>Status</th>
                <th className={queueUi.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className={`${queueUi.rowBase} ${rowStateClass(o.status)}`}>
                  <td className="px-4 py-3">
                    {isSelectableForBulk(o.status) && (
                      <input
                        type="checkbox"
                        checked={selected.has(o.id)}
                        onChange={() => toggle(o.id)}
                        className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a href={o.url} target="_blank" rel="noreferrer" className={`${queueUi.cellTitle} hover:text-violet-300`}>
                      {o.title}
                    </a>
                    <div className={queueUi.cellSub}>{o.merchant} · {o.category}</div>
                  </td>
                  <td className={`px-4 py-3 ${queueUi.cellMuted}`}>
                    {DISCOVERY_PROFILES[o.rewardType].label}
                  </td>
                  <td className={`px-4 py-3 ${queueUi.cellMuted}`}>
                    {o.discountText ?? "—"}
                    {o.promoCode && <span className="ml-1 text-[11px] font-mono text-amber-300">{o.promoCode}</span>}
                  </td>
                  <td className={`px-4 py-3 ${queueUi.cellMuted}`}>{o.country}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-400">{o.score}</td>
                  <td className={`px-4 py-3 ${queueUi.dateCell}`}>
                    {new Date(o.discoveredAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${queueUi.badge} ${statusBadgeClass(o.status)}`}>
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <OfferRowActions offer={o} busy={busy} onAction={onAction} onDetails={setDetail} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={queueUi.footerHint}>
        Showing {filtered.length} of {offers.length} offers · approved offers publish to the marketplace “Live Offers”.
      </div>

      {detail && <OfferDetailModal offer={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
