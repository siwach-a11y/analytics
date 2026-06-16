import { ReactNode } from "react";
import { PLATFORM_SNIPE_FEE_PERCENT } from "@/lib/platform/fee";

interface SniperBannerProps {
  title?: string;
  description: ReactNode;
  icon?: string;
  accent?: "coral" | "blue" | "teal";
}

const accents = {
  coral: "border-hub-coral/20 bg-gradient-to-r from-hub-coral-light/60 to-white/80",
  blue: "border-hub-blue/20 bg-gradient-to-r from-hub-blue-light/60 to-white/80",
  teal: "border-hub-teal/20 bg-gradient-to-r from-hub-teal-light/60 to-white/80",
};

const titleColors = {
  coral: "text-hub-coral",
  blue: "text-hub-blue",
  teal: "text-hub-teal",
};

export default function SniperBanner({
  title = "Ticket Sniper Bot",
  description,
  icon = "🎯",
  accent = "coral",
}: SniperBannerProps) {
  return (
    <div
      className={`glass-panel p-5 flex items-start gap-4 ${accents[accent]}`}
    >
      <div className="icon-box w-12 h-12 text-xl shrink-0">{icon}</div>
      <div>
        <h3 className={`font-semibold tracking-tight ${titleColors[accent]}`}>
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>
        <p className="text-xs text-slate-400 mt-2">
          AgentHub charges a {PLATFORM_SNIPE_FEE_PERCENT}% platform fee on every
          snipe.
        </p>
      </div>
    </div>
  );
}
