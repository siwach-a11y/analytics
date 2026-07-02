"use client";

import { useEffect, useRef, useState } from "react";
import { queueUi } from "@/lib/pipeline/queueTheme";
import { ALL_STATUSES, statusLabel } from "@/lib/pipeline/offerStatus";

export default function QueueHealthDropdown({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const total = ALL_STATUSES.reduce((n, s) => n + (counts[s] ?? 0), 0);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={queueUi.queueHealthTrigger}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="tabular-nums font-semibold">{total}</span>
        <span className={`ml-1.5 ${queueUi.queueHealthTriggerHint}`}>total</span>
        <span className="ml-1 opacity-70" aria-hidden>▾</span>
      </button>
      {open && (
        <div className={queueUi.queueHealthPanel} role="listbox">
          <p className={queueUi.queueHealthPanelTitle}>Queue health</p>
          <ul className="mt-2 space-y-1.5">
            {ALL_STATUSES.map((s) => (
              <li key={s} className={queueUi.queueHealthRow}>
                <span>{statusLabel(s)}</span>
                <span className="tabular-nums font-medium">{counts[s] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
