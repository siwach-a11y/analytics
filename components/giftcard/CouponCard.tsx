"use client";

import { useState } from "react";
import { CouponResult } from "@/lib/giftcard/types";
import { getCountry } from "@/lib/giftcard/countries";
import { TrustBadge, VerifiedBadge } from "./TrustBadge";

export default function CouponCard({ coupon }: { coupon: CouponResult }) {
  const country = getCountry(coupon.country);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!coupon.code) return;
    navigator.clipboard?.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <article className="glass-card p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate">{coupon.merchant}</h3>
          <p className="text-xs text-slate-500">
            {coupon.couponType} · {country?.flag} {country?.name ?? coupon.country}
          </p>
        </div>
        {coupon.discount && (
          <span className="text-lg font-bold text-fuchsia-300 shrink-0">{coupon.discount}</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {coupon.verified && <VerifiedBadge />}
        <TrustBadge score={coupon.trustScore} />
        {coupon.expiration && (
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400">Ends {coupon.expiration}</span>
        )}
      </div>

      {coupon.code && (
        <button
          onClick={copy}
          className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-dashed border-violet-400/40 bg-violet-500/10 px-3 py-2 text-sm font-mono text-violet-200 hover:bg-violet-500/20 transition-colors"
        >
          <span className="truncate">{coupon.code}</span>
          <span className="text-[11px] font-sans font-medium text-violet-300 shrink-0">
            {copied ? "Copied!" : "Copy"}
          </span>
        </button>
      )}

      {coupon.terms && (
        <p className="mt-2 text-[11px] text-slate-500 line-clamp-2">{coupon.terms}</p>
      )}

      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 truncate">{coupon.source ?? new URL(coupon.url).hostname.replace(/^www\./, "")}</span>
        <a href={coupon.url} target="_blank" rel="noreferrer" className="btn-secondary !py-1.5 !px-3 !text-xs shrink-0">
          Open
        </a>
      </div>
    </article>
  );
}
