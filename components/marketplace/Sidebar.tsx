"use client";

import Link from "next/link";
import { ReactNode } from "react";

function Icon({ path }: { path: ReactNode }) {
  return (
    <svg
      className="w-[18px] h-[18px] shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  );
}

const NAV: { label: string; href: string; active?: boolean; icon: ReactNode }[] = [
  { label: "Home", href: "/", active: true, icon: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" /> },
  { label: "All Agents", href: "#all", icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></> },
  { label: "Categories", href: "#categories", icon: <><path d="M4 6h16M4 12h16M4 18h16" /></> },
  { label: "Featured", href: "#featured", icon: <path d="m12 3 2.6 5.8 6.4.6-4.8 4.3 1.4 6.3L12 17.8 6 20.3l1.4-6.3L2.6 9.4l6.4-.6z" /> },
  { label: "Trending", href: "#all", icon: <path d="m3 17 6-6 4 4 8-8M21 7v5h-5" /> },
  { label: "New Agents", href: "#all", icon: <path d="M12 5v14M5 12h14" /> },
  { label: "Operator", href: "/operator", icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-1.7-1L15 2H9l-.3 2.5a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.5L2.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 0 0 1.7 1L9 22h6l.3-2.5a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.5z" /></> },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-white/10 bg-[#0c0818]/80 backdrop-blur-xl px-4 py-5">
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-7">
        <div className="icon-box w-10 h-10 text-lg">🎟️</div>
        <div className="leading-tight">
          <div className="font-bold tracking-tight text-white">AgentHub</div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-violet-400">
            Rewards Marketplace
          </div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`nav-item ${item.active ? "nav-item-active" : ""}`}
          >
            <Icon path={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 p-4">
          <div className="font-semibold text-white text-sm">Become a Creator</div>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Build your own AI agent and publish to millions of shoppers.
          </p>
          <button className="btn-primary !py-2 !px-3.5 !text-xs mt-3 w-full">
            Learn More
          </button>
        </div>

        <div className="flex items-center justify-between px-2 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <Icon path={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M6 6 4.5 4.5M19.5 19.5 18 18M6 18l-1.5 1.5M19.5 4.5 18 6" /></>} />
            Dark Mode
          </span>
          <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-violet-600">
            <span className="absolute right-0.5 h-4 w-4 rounded-full bg-white" />
          </span>
        </div>
      </div>
    </aside>
  );
}
