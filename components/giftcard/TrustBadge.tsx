export function TrustBadge({ score }: { score: number }) {
  const cls =
    score >= 80
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
      : score >= 50
        ? "bg-amber-500/15 text-amber-300 border-amber-400/30"
        : "bg-slate-500/15 text-slate-300 border-white/15";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {score}
    </span>
  );
}

export function OfficialBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-violet-400/30 bg-violet-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-violet-300">
      Official
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/30 bg-sky-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-sky-300">
      ✓ Verified
    </span>
  );
}
