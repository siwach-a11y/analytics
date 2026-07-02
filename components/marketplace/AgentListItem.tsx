"use client";

import Link from "next/link";
import { Agent } from "@/lib/types";

export default function AgentListItem({ agent }: { agent: Agent }) {
  return (
    <Link href={`/agents/${agent.id}`} className="group block">
      <article className="glass-card p-4 flex items-start gap-3.5">
        <div className="icon-box w-11 h-11 text-xl shrink-0 group-hover:scale-105 transition-transform">
          {agent.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
              {agent.name}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 shrink-0">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {agent.rating}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-1 line-clamp-2">
            {agent.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
