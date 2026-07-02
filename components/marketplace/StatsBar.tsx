import { ReactNode } from "react";

function StatIcon({ path }: { path: ReactNode }) {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}

interface StatsBarProps {
  totalAgents: number;
  monthlyUsers: number;
}

export default function StatsBar({ totalAgents, monthlyUsers }: StatsBarProps) {
  const shoppers =
    monthlyUsers >= 1000 ? `${Math.round(monthlyUsers / 1000)}K+` : `${monthlyUsers}`;

  const stats = [
    { value: totalAgents, label: "AI Agents", icon: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></> },
    { value: shoppers, label: "Happy Shoppers", icon: <><circle cx="9" cy="8" r="3" /><path d="M15 11a3 3 0 1 0 0-6M3 20a6 6 0 0 1 12 0M15 14a6 6 0 0 1 6 6" /></> },
    { value: "100K+", label: "Offers Found", icon: <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" /> },
    { value: "24/7", label: "AI Assistance", icon: <path d="M13 2 4.5 13H11l-1 9 8.5-11H12z" /> },
  ];

  return (
    <div className="glass-panel p-1.5">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-3.5 px-5 py-4 ${
              i > 0 ? "md:border-l border-white/10" : ""
            }`}
          >
            <div className="icon-box w-11 h-11 text-violet-300">
              <StatIcon path={s.icon} />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-none">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
