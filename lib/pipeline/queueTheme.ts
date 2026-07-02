// Centralized class bundles for the offer-queue back office — a violet-themed
// port of Fando's getVideoQueueUi. One object so the table, filter bar, health
// dropdown, summary bar, buttons, and modal stay visually consistent.
export const queueUi = {
  outerShell:
    "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden",

  // Summary bar (top): status counts
  summaryBar:
    "flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5 border-b border-white/10",
  summaryLabel: "text-xs text-slate-400",
  summarySep: "h-4 w-px bg-white/10",

  // Filter bar
  filterBar:
    "flex flex-wrap items-center gap-3 px-5 py-3 border-b border-white/10 bg-white/[0.02]",
  selectLabel: "text-[11px] font-medium uppercase tracking-wide text-slate-500 mr-1",
  selectControl:
    "rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 py-1.5 pl-2.5 pr-7 focus:outline-none focus:border-violet-400/50",
  inputSm:
    "rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 py-1.5 px-2.5 focus:outline-none focus:border-violet-400/50",

  // Queue-health dropdown
  queueHealthTrigger:
    "inline-flex items-center rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-sm text-slate-200 hover:bg-white/10 transition-colors",
  queueHealthTriggerHint: "text-xs text-slate-500",
  queueHealthPanel:
    "absolute right-0 z-20 mt-2 w-56 rounded-xl border border-white/10 bg-[#140f24] p-3 shadow-2xl shadow-black/60",
  queueHealthPanelTitle: "text-[11px] font-semibold uppercase tracking-wide text-slate-500",
  queueHealthRow: "flex items-center justify-between text-sm text-slate-300",

  // Table
  tableScrollArea: "overflow-x-auto",
  tableStickyHead:
    "sticky top-0 z-10 bg-[#0f0a1e]/95 backdrop-blur text-[11px] font-semibold uppercase tracking-wide text-slate-500",
  th: "px-4 py-3 text-left font-medium whitespace-nowrap",
  rowBase: "border-b border-white/5 align-top hover:bg-white/[0.03] transition-colors",
  cellTitle: "font-medium text-white",
  cellSub: "text-xs text-slate-500",
  cellMuted: "text-slate-400",
  dateCell: "text-xs text-slate-500 tabular-nums whitespace-nowrap",

  // Bulk selection bar
  bulkBar:
    "flex flex-wrap items-center gap-3 px-5 py-2.5 border-b border-white/10 bg-violet-500/10",

  // Buttons
  btnApprove:
    "px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-400/30 text-xs font-medium hover:bg-sky-500/25 transition-colors disabled:opacity-40",
  btnPublish:
    "px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-medium hover:bg-emerald-500/25 transition-colors disabled:opacity-40",
  btnReject:
    "px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-400/30 text-xs font-medium hover:bg-rose-500/25 transition-colors disabled:opacity-40",
  btnGhost:
    "px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10 text-xs font-medium hover:bg-white/10 transition-colors",

  // Misc
  emptyBox: "px-5 py-16 text-center text-sm text-slate-400",
  footerHint: "px-5 py-3 border-t border-white/10 text-xs text-slate-500",
  badge:
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",

  // Modal
  modalBackdrop:
    "fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm",
  modalPanel:
    "w-full max-w-lg rounded-2xl border border-white/10 bg-[#140f24] shadow-2xl",
} as const;

export type QueueUi = typeof queueUi;
