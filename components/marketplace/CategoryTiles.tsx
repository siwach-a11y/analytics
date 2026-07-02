import Link from "next/link";

const TILES: { label: string; icon: string; href: string; ring: string; glow: string }[] = [
  { label: "Vouchers", icon: "🎟️", href: "/agents/voucher-discovery", ring: "from-violet-500/25 to-violet-500/5", glow: "ring-violet-400/30" },
  { label: "Daily Deals", icon: "📅", href: "/agents/daily-deals", ring: "from-sky-500/25 to-sky-500/5", glow: "ring-sky-400/30" },
  { label: "Cashback", icon: "💵", href: "/agents/cashback", ring: "from-green-500/25 to-green-500/5", glow: "ring-green-400/30" },
  { label: "Promo Codes", icon: "🏷️", href: "/agents/promo-code", ring: "from-fuchsia-500/25 to-fuchsia-500/5", glow: "ring-fuchsia-400/30" },
  { label: "Loyalty", icon: "🎁", href: "/agents/loyalty-rewards", ring: "from-amber-500/25 to-amber-500/5", glow: "ring-amber-400/30" },
  { label: "Buy 1 Get 1", icon: "🛍️", href: "/agents/buy-one-get-one", ring: "from-rose-500/25 to-rose-500/5", glow: "ring-rose-400/30" },
  { label: "Flash Sales", icon: "🔥", href: "/agents/flash-sale", ring: "from-orange-500/25 to-orange-500/5", glow: "ring-orange-400/30" },
  { label: "Discovery", icon: "🧭", href: "/operator", ring: "from-teal-500/25 to-teal-500/5", glow: "ring-teal-400/30" },
];

export default function CategoryTiles() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {TILES.map((t) => (
        <Link key={t.label} href={t.href} className="category-tile group">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.ring} ring-1 ${t.glow}
              flex items-center justify-center text-2xl group-hover:scale-105 transition-transform`}
          >
            {t.icon}
          </div>
          <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
            {t.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
