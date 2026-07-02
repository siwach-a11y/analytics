"use client";

interface StatusBarProps {
  status: "idle" | "thinking";
  message?: string;
}

export default function StatusBar({
  status,
  message = "Ready",
}: StatusBarProps) {
  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
      <span className="relative flex h-2 w-2 shrink-0">
        {status === "thinking" ? (
          <span className="absolute inline-flex h-full w-full rounded-full bg-hub-purple opacity-75 animate-ping" />
        ) : null}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            status === "thinking" ? "bg-hub-purple" : "bg-hub-blue"
          }`}
        />
      </span>
      <span>{status === "thinking" ? "Thinking..." : message}</span>
    </div>
  );
}
