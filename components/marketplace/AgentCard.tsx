"use client";

import Link from "next/link";
import { Agent } from "@/lib/types";

interface AgentCardProps {
  agent: Agent;
  featured?: boolean;
}

export default function AgentCard({ agent, featured }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.id}`} className="group block h-full">
      <article
        className={`glass-card p-5 h-full flex flex-col ${
          featured ? "ring-1 ring-violet-400/20" : ""
        }`}
      >
        <div className="icon-box w-12 h-12 text-2xl mb-4 group-hover:scale-105 transition-transform duration-300">
          {agent.icon}
        </div>

        <h3 className="font-semibold text-white tracking-tight group-hover:text-violet-300 transition-colors">
          {agent.name}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed mt-1.5 mb-4 flex-1 line-clamp-2">
          {agent.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-500/15 px-2 py-0.5 text-[11px] font-semibold text-violet-300 ring-1 ring-violet-400/25">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            AI
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {agent.rating}
          </span>
        </div>

        <span className="btn-primary w-full !py-2.5">
          Launch
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </article>
    </Link>
  );
}
