const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Marketplace", links: ["All Agents", "Categories", "Featured", "Flash Sales", "New Agents"] },
  { title: "Resources", links: ["Guides", "Blog", "Help Center", "API Docs", "Community"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclaimer"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 pt-10 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="icon-box w-9 h-9 text-base">🎟️</div>
            <span className="font-bold text-white">AgentHub</span>
          </div>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-xs">
            The marketplace for AI agents that find you the best vouchers, deals,
            cashback, and rewards.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="text-sm font-semibold text-white mb-3">{col.title}</div>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <span className="text-xs text-slate-400 hover:text-violet-300 transition-colors cursor-pointer">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-5 border-t border-white/10 text-center text-xs text-slate-500">
        © 2026 AgentHub — Voucher &amp; Rewards Marketplace. All rights reserved.
      </div>
    </footer>
  );
}
