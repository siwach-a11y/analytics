import { GiftCardResult } from "@/lib/giftcard/types";
import { getCountry } from "@/lib/giftcard/countries";
import { TrustBadge, OfficialBadge } from "./TrustBadge";

export default function GiftCardCard({ card }: { card: GiftCardResult }) {
  const country = getCountry(card.country);
  const price = card.sellingPrice ?? card.faceValue;
  return (
    <article className="glass-card p-4 flex flex-col">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/20 ring-1 ring-violet-400/30 flex items-center justify-center text-base font-bold text-white shrink-0">
          {card.brand.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate">{card.brand}</h3>
          <p className="text-xs text-slate-500">
            {card.category} · {country?.flag} {country?.name ?? card.country}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {card.sourceType === "official" ? <OfficialBadge /> : (
          <span className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[11px] font-semibold text-slate-300">Marketplace</span>
        )}
        <TrustBadge score={card.trustScore} />
        {card.availability && (
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400">{card.availability}</span>
        )}
      </div>

      {(price || card.currency) && (
        <div className="mt-3 text-sm">
          <span className="text-lg font-bold text-white">{price ?? "—"}</span>
          {card.currency && <span className="ml-1 text-xs text-slate-500">{card.currency}</span>}
          {card.faceValue && card.sellingPrice && (
            <span className="ml-2 text-xs text-slate-500">face {card.faceValue}</span>
          )}
        </div>
      )}

      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 truncate">{card.source ?? new URL(card.url).hostname.replace(/^www\./, "")}</span>
        <a href={card.url} target="_blank" rel="noreferrer" className="btn-primary !py-1.5 !px-3 !text-xs shrink-0">
          Buy
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </article>
  );
}
