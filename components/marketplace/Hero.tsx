import Link from "next/link";

const FLOAT_ICONS = [
  { icon: "🎟️", cls: "top-6 left-8" },
  { icon: "💵", cls: "top-10 right-10" },
  { icon: "🏷️", cls: "top-1/2 left-4 -translate-y-1/2" },
  { icon: "🎁", cls: "top-1/2 right-6 -translate-y-1/2" },
  { icon: "🔥", cls: "bottom-8 left-16" },
  { icon: "🛍️", cls: "bottom-10 right-16" },
];

export default function Hero() {
  return (
    <section className="grid lg:grid-cols-2 gap-8 items-center animate-slide-up">
      <div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1]">
          <span className="gradient-text">Discover AI Agents</span>
          <br />
          <span className="text-white">Built for Smart Shoppers</span>
        </h1>
        <p className="mt-5 text-slate-400 text-base max-w-lg leading-relaxed">
          Specialized AI agents that hunt vouchers, track cashback, surface daily
          deals and flash sales, and redeem loyalty rewards — so you always find
          the best savings.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="#all" className="btn-primary !px-5 !py-3">
            Explore Agents
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link href="#featured" className="btn-secondary !px-5 !py-3">
            View Featured
          </Link>
        </div>
      </div>

      {/* Neon illustration panel */}
      <div className="relative h-64 sm:h-80 rounded-3xl border border-white/10 overflow-hidden
        bg-gradient-to-br from-violet-600/25 via-fuchsia-600/10 to-transparent">
        <div className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 60%, rgba(217,70,239,0.35), transparent 55%)",
          }}
        />
        {/* central glowing orb */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500
          shadow-[0_0_60px_-5px_rgba(217,70,239,0.8)] flex items-center justify-center text-5xl">
          🤖
        </div>
        {FLOAT_ICONS.map((f, i) => (
          <div
            key={i}
            className={`absolute ${f.cls} w-11 h-11 rounded-xl border border-white/15
              bg-white/5 backdrop-blur-md flex items-center justify-center text-lg
              shadow-lg shadow-black/30`}
          >
            {f.icon}
          </div>
        ))}
      </div>
    </section>
  );
}
