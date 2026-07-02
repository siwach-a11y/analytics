// Status model for the offer queue — a voucher-domain port of Fando's
// video-status.ts: normalization, badge classes, labels, action gating, and
// row-state theming keyed off the pipeline status.
import { PipelineStatus } from "./types";

export type QueueAction = "approve" | "reject" | "publish";

export const STATUS_LABELS: Record<PipelineStatus, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
};

export function statusLabel(status: PipelineStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/** Dark-glass badge classes per status (violet theme). */
export function statusBadgeClass(status: PipelineStatus): string {
  switch (status) {
    case "pending_approval":
      return "bg-amber-500/15 text-amber-300 border-amber-400/30";
    case "approved":
      return "bg-sky-500/15 text-sky-300 border-sky-400/30";
    case "published":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
    case "rejected":
      return "bg-rose-500/15 text-rose-300 border-rose-400/30";
    default:
      return "bg-white/5 text-slate-300 border-white/10";
  }
}

/** Left row-accent + subtle tint per status (mirrors Fando row states). */
export function rowStateClass(status: PipelineStatus): string {
  switch (status) {
    case "published":
      return "border-l-2 border-l-emerald-400/60 bg-emerald-500/[0.03]";
    case "approved":
      return "border-l-2 border-l-sky-400/60 bg-sky-500/[0.03]";
    case "rejected":
      return "border-l-2 border-l-rose-400/40 opacity-60";
    default:
      return "border-l-2 border-l-transparent";
  }
}

export function canApprove(status: PipelineStatus): boolean {
  return status === "pending_approval" || status === "rejected";
}
export function canReject(status: PipelineStatus): boolean {
  return status === "pending_approval" || status === "approved";
}
export function canPublish(status: PipelineStatus): boolean {
  return status === "approved";
}

/** Selectable for bulk operations (has at least one applicable action). */
export function isSelectableForBulk(status: PipelineStatus): boolean {
  return canApprove(status) || canReject(status) || canPublish(status);
}

export function statusHint(status: PipelineStatus): string {
  switch (status) {
    case "pending_approval":
      return "Awaiting review";
    case "approved":
      return "Ready to publish";
    case "published":
      return "Live on the marketplace";
    case "rejected":
      return "Rejected — approve to restore";
    default:
      return "";
  }
}

export const ALL_STATUSES: PipelineStatus[] = [
  "pending_approval",
  "approved",
  "published",
  "rejected",
];
