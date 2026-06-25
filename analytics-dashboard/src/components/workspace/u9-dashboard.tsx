"use client";

import { useMemo } from "react";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { getWorkspaceAnalytics } from "@/data/u9-analytics";
import { formatNumber } from "@/lib/formatters";

function SectionCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-[#e8e0d4] bg-white p-5 shadow-sm ${className ?? ""}`}
    >
      <h2 className="font-serif text-xl font-medium tracking-tight text-[#2c2416]">
        {title}
      </h2>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8a7f72]">
        {subtitle}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function KpiCard({ label, value, subtitle }: { label: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-lg border border-[#e8e0d4] bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a7f72]">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#1a1510]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8a7f72]">{subtitle}</p>
    </div>
  );
}

export function U9Dashboard() {
  const { workspaceId } = useWorkspace();
  const data = useMemo(() => getWorkspaceAnalytics(workspaceId), [workspaceId]);

  return (
    <div className="min-h-full bg-[#f3ece3] text-[#2c2416]">
      <div className="border-b border-[#e8e0d4] bg-[#f3ece3]/95 px-4 py-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{data.workspace.flag}</span>
          <h1 className="font-serif text-3xl font-medium tracking-tight">
            {data.workspace.name}
          </h1>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6b6258]">
          {data.apiNote}
        </p>
      </div>

      <div className="space-y-5 p-4 lg:p-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {data.kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        <SectionCard
          title="Token economy"
          subtitle="EARN-SIDE COMPOSITION · 30-DAY · — = NOT YET EXPOSED BY BNII"
        >
          <div className="grid gap-x-12 gap-y-2 sm:grid-cols-2">
            {data.earnComposition.map((line) => (
              <div
                key={line.label}
                className="flex items-center justify-between border-b border-[#f0e8dc] py-2 text-sm"
              >
                <span className="text-[#5c5348]">{line.label}</span>
                <span className="font-mono font-medium tabular-nums">{line.value}</span>
              </div>
            ))}
            <div
              className="flex items-center justify-between border-t border-[#e8e0d4] py-2 text-sm font-semibold sm:col-span-2"
            >
              <span>Total earned</span>
              <span className="font-mono tabular-nums">{data.totalEarned}</span>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard title="Burn mix" subtitle="WHERE REDEMPTION VOLUME GOES">
            <div className="flex h-10 w-full overflow-hidden rounded-md">
              {data.burnMix.map((seg) => (
                <div
                  key={seg.label}
                  className="flex items-center justify-center text-[10px] font-medium text-white"
                  style={{
                    width: `${seg.percent}%`,
                    backgroundColor: seg.color,
                    minWidth: seg.percent > 0 ? "2rem" : 0,
                  }}
                >
                  {seg.percent >= 8 ? `${seg.percent}%` : ""}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {data.burnMix.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-[#5c5348]">{seg.label}</span>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-[#5c5348]">
                    {seg.percent}% ({formatNumber(seg.volume, true)})
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Engagement"
            subtitle="PER-USER BEHAVIOUR · DERIVED FROM LIVE BNII FIELDS"
          >
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {data.engagement.map((m) => (
                <div key={m.label} className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-[#5c5348]">{m.label}</span>
                  <span className="font-mono font-medium tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Workspace details" subtitle="CONTRACT & IDENTITY (ATLAS CONFIG)">
          <div className="grid gap-x-12 gap-y-3 sm:grid-cols-2">
            {data.workspaceDetails.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-[#f0e8dc] py-2 text-sm"
              >
                <span className="text-[#5c5348]">{row.label}</span>
                <span className="font-mono font-medium tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
