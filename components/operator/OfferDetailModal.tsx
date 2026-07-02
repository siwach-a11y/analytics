"use client";

import { DiscoveredOffer } from "@/lib/pipeline/types";
import { queueUi } from "@/lib/pipeline/queueTheme";
import { statusBadgeClass, statusLabel, statusHint } from "@/lib/pipeline/offerStatus";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className="text-sm text-slate-200 text-right break-words min-w-0">{children}</span>
    </div>
  );
}

export default function OfferDetailModal({
  offer,
  onClose,
}: {
  offer: DiscoveredOffer;
  onClose: () => void;
}) {
  return (
    <div className={queueUi.modalBackdrop} onClick={onClose}>
      <div className={queueUi.modalPanel} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 px-5 py-4 border-b border-white/10">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate">{offer.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {offer.merchant} · {offer.category}
            </p>
          </div>
          <span className={`${queueUi.badge} ${statusBadgeClass(offer.status)}`}>
            {statusLabel(offer.status)}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 flex items-center justify-center shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-3">
          <p className="text-xs text-violet-300 mb-2">{statusHint(offer.status)}</p>
          <Row label="Value">{offer.discountText ?? "—"}</Row>
          {offer.promoCode && <Row label="Promo code"><span className="font-mono text-amber-300">{offer.promoCode}</span></Row>}
          <Row label="Region">{offer.country}</Row>
          <Row label="Score">
            <span className="tabular-nums">{offer.score}</span>
          </Row>
          <Row label="Redeem URL">
            <a href={offer.url} target="_blank" rel="noreferrer" className="text-violet-300 hover:underline">
              {offer.url}
            </a>
          </Row>
          {offer.sourceUrl && (
            <Row label="Source">
              <a href={offer.sourceUrl} target="_blank" rel="noreferrer" className="text-violet-300 hover:underline">
                {offer.sourceUrl}
              </a>
            </Row>
          )}
          {offer.notes && <Row label="Gate signals"><span className="text-xs text-slate-400">{offer.notes}</span></Row>}
          <Row label="Discovered">
            <span className="text-xs tabular-nums">{new Date(offer.discoveredAt).toLocaleString()}</span>
          </Row>
        </div>
      </div>
    </div>
  );
}
