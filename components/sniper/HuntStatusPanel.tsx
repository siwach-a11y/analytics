"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  cancelHunt,
  ensureUser,
  fetchHunts,
  getStoredUserId,
  startHunt,
} from "@/lib/ticket-sniper/client";
import { TICKET_SNIPER_WS_URL } from "@/lib/ticket-sniper/config";
import {
  getStatusLabel,
  isTerminalStatus,
  statusColor,
} from "@/lib/ticket-sniper/utils";
import { HuntRecord, HuntUpdateMessage } from "@/lib/ticket-sniper/types";
import StatusBar from "@/components/ui/StatusBar";

interface HuntStatusPanelProps {
  refreshKey?: number;
}

export default function HuntStatusPanel({ refreshKey }: HuntStatusPanelProps) {
  const [hunts, setHunts] = useState<HuntRecord[]>([]);
  const [queuePositions, setQueuePositions] = useState<Record<string, number>>(
    {}
  );
  const [sessionTokens, setSessionTokens] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [modeReady, setModeReady] = useState(false);

  const loadHunts = useCallback(async () => {
    try {
      const userId = getStoredUserId() ?? (await ensureUser());
      const data = await fetchHunts(userId);
      setHunts(data.hunts);
      setQueuePositions(data.queuePositions);
      setSessionTokens(data.sessionTokens);
      setDemoMode(data.demo);
    } catch {
      setHunts([]);
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const res = await fetch("/api/ticket-sniper/health");
        const data = await res.json();
        if (!cancelled) {
          setDemoMode(Boolean(data.demo));
          setModeReady(true);
        }
      } catch {
        if (!cancelled) {
          setDemoMode(true);
          setModeReady(true);
        }
      }
      if (!cancelled) loadHunts();
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [loadHunts, refreshKey]);

  useEffect(() => {
    if (!modeReady) return;

    if (demoMode) {
      const interval = setInterval(loadHunts, 1500);
      return () => clearInterval(interval);
    }

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(TICKET_SNIPER_WS_URL);
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data) as HuntUpdateMessage;
        if (msg.type === "HUNT_UPDATE") {
          setHunts((prev) =>
            prev.map((h) =>
              h.id === msg.huntId
                ? { ...h, status: msg.payload.status ?? h.status }
                : h
            )
          );
          if (msg.payload.queuePosition != null) {
            setQueuePositions((prev) => ({
              ...prev,
              [msg.huntId]: msg.payload.queuePosition!,
            }));
          }
        }
      };
    } catch {
      const interval = setInterval(loadHunts, 3000);
      return () => clearInterval(interval);
    }
    return () => ws?.close();
  }, [demoMode, modeReady, loadHunts]);

  const activeHunts = hunts.filter((h) => !isTerminalStatus(h.status));

  if (loading) {
    return <StatusBar status="thinking" message="Loading active hunts..." />;
  }

  if (hunts.length === 0) return null;

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 tracking-tight">
          <span className="icon-box w-8 h-8 text-sm">🎯</span>
          Ticket Sniper Hunts
          {demoMode && (
            <span className="badge-pill bg-hub-amber-light/80 text-hub-amber border-hub-amber/20 !normal-case !tracking-normal">
              Demo
            </span>
          )}
        </h3>
        <span className="text-xs font-medium text-slate-400">
          {activeHunts.length} active
        </span>
      </div>

      <div className="space-y-2">
        {hunts.map((hunt) => {
          const queue = queuePositions[hunt.id] ?? null;
          const sessionToken = sessionTokens[hunt.id];
          const eventName = hunt.event?.name ?? "Unknown Event";
          const needsHandoff = ["WAITING_CAPTCHA", "WAITING_OTP"].includes(
            hunt.status
          );

          return (
            <div
              key={hunt.id}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900">{eventName}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span
                    className={`badge-pill !normal-case !tracking-normal border-transparent ${statusColor(hunt.status)}`}
                  >
                    {getStatusLabel(hunt.status)}
                  </span>
                  {queue != null && queue > 0 && (
                    <span className="text-xs text-slate-400 font-medium">
                      Queue #{queue}
                    </span>
                  )}
                  <span className="text-xs text-slate-300">
                    Qty {hunt.quantity}
                  </span>
                </div>
                {needsHandoff && sessionToken && (
                  <Link
                    href={`/session/${sessionToken}`}
                    className="btn-coral !inline-flex !py-1.5 !px-3 !text-xs mt-2.5"
                  >
                    Complete {hunt.status === "WAITING_OTP" ? "OTP" : "CAPTCHA"} →
                  </Link>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {hunt.status === "CREATED" && (
                  <button
                    onClick={async () => {
                      await startHunt(hunt.id);
                      loadHunts();
                    }}
                    className="btn-primary !py-1.5 !px-3 !text-xs"
                  >
                    Start
                  </button>
                )}
                {!isTerminalStatus(hunt.status) && hunt.status !== "CREATED" && (
                  <button
                    onClick={async () => {
                      await cancelHunt(hunt.id);
                      loadHunts();
                    }}
                    className="btn-secondary !py-1.5 !px-3 !text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
