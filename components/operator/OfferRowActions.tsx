"use client";

import { DiscoveredOffer } from "@/lib/pipeline/types";
import { canApprove, canPublish, canReject, QueueAction } from "@/lib/pipeline/offerStatus";
import { queueUi } from "@/lib/pipeline/queueTheme";

export default function OfferRowActions({
  offer,
  busy,
  onAction,
  onDetails,
}: {
  offer: DiscoveredOffer;
  busy: boolean;
  onAction: (id: string, action: QueueAction) => void;
  onDetails: (offer: DiscoveredOffer) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {canApprove(offer.status) && (
        <button
          disabled={busy}
          onClick={() => onAction(offer.id, "approve")}
          className={queueUi.btnApprove}
        >
          Approve
        </button>
      )}
      {canPublish(offer.status) && (
        <button
          disabled={busy}
          onClick={() => onAction(offer.id, "publish")}
          className={queueUi.btnPublish}
        >
          Publish
        </button>
      )}
      {canReject(offer.status) && (
        <button
          disabled={busy}
          onClick={() => onAction(offer.id, "reject")}
          className={queueUi.btnReject}
        >
          Reject
        </button>
      )}
      <button onClick={() => onDetails(offer)} className={queueUi.btnGhost}>
        Details
      </button>
    </div>
  );
}
