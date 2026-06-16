"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchSession,
  resumeSession,
} from "@/lib/ticket-sniper/client";
import { getStatusLabel } from "@/lib/ticket-sniper/utils";
import { HuntStatus } from "@/lib/ticket-sniper/types";
import StatusBar from "@/components/ui/StatusBar";

interface SessionHandoffProps {
  token: string;
}

export default function SessionHandoff({ token }: SessionHandoffProps) {
  const [session, setSession] = useState<Record<string, unknown> | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchSession(token)
      .then((data) => setSession(data.session))
      .catch(() => setError("Session not found or expired"))
      .finally(() => setLoading(false));
  }, [token]);

  const status = session?.status as string | undefined;
  const hunt = session?.hunt as Record<string, unknown> | undefined;
  const huntStatus = (hunt?.status as string) ?? "UNKNOWN";

  async function handleContinue() {
    setResuming(true);
    try {
      await resumeSession(token, "continue");
      setDone(true);
    } catch {
      setError("Failed to resume automation");
    } finally {
      setResuming(false);
    }
  }

  async function handleSubmitOtp() {
    if (!otp) return;
    setResuming(true);
    try {
      await resumeSession(token, "submit_otp", otp);
      setDone(true);
    } catch {
      setError("Failed to submit OTP");
    } finally {
      setResuming(false);
    }
  }

  if (loading) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <StatusBar status="thinking" message="Loading session..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel p-8 text-center">
          <p className="text-hub-coral font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen flex items-center justify-center p-4">
      <div className="glass-dock rounded-2xl p-6 sm:p-8 w-full max-w-lg space-y-5 animate-slide-up">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-slate-900 tracking-tight flex items-center gap-2">
            🎟 Ticket Sniper Session
          </h1>
          <span className="badge-pill bg-hub-amber-light/80 text-hub-amber border-hub-amber/20 !normal-case !tracking-normal">
            {getStatusLabel(huntStatus as HuntStatus)}
          </span>
        </div>

        {status === "WAITING_CAPTCHA" && (
          <>
            <p className="text-sm text-slate-500 leading-relaxed">
              Solve the CAPTCHA in your browser, then click Continue to resume
              automation.
            </p>
            <button
              onClick={handleContinue}
              disabled={resuming || done}
              className="btn-primary w-full"
            >
              {done ? "Automation Resumed" : resuming ? "Resuming..." : "Continue"}
            </button>
          </>
        )}

        {status === "WAITING_OTP" && (
          <>
            <p className="text-sm text-slate-500 leading-relaxed">
              Enter the SMS OTP code you received to continue checkout.
            </p>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength={8}
              className="input-modern"
            />
            <button
              onClick={handleSubmitOtp}
              disabled={resuming || done || !otp}
              className="btn-primary w-full"
            >
              {done ? "OTP Submitted" : resuming ? "Submitting..." : "Submit OTP"}
            </button>
          </>
        )}

        {status !== "WAITING_CAPTCHA" && status !== "WAITING_OTP" && (
          <>
            <p className="text-sm text-slate-500 leading-relaxed">
              Review your session and continue when ready.
            </p>
            <button
              onClick={handleContinue}
              disabled={resuming || done}
              className="btn-primary w-full"
            >
              {done ? "Done" : "Continue"}
            </button>
          </>
        )}

        {done && (
          <Link
            href="/agents/concert-ticket-finder"
            className="block text-center text-sm font-medium text-hub-blue hover:underline mt-2"
          >
            ← Back to Concert Finder
          </Link>
        )}
      </div>
    </div>
  );
}
