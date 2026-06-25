import {
  getEarnChannels,
  getWorkspace,
  WORKSPACES,
  type WorkspaceId,
  type WorkspaceMetrics,
} from "@/data/workspaces";

export type U9Kpi = {
  label: string;
  value: string;
  subtitle: string;
};

export type U9EarnLine = { label: string; value: string };
export type U9BurnSegment = {
  label: string;
  percent: number;
  volume: number;
  color: string;
};
export type U9EngagementMetric = { label: string; value: string };
export type U9WorkspaceDetail = { label: string; value: string };

export type U9Analytics = {
  workspace: {
    id: string;
    code: string;
    name: string;
    country: string;
    flag: string;
    tier: string;
    status: string;
    subscribers: string;
    mrr: string;
    contractEnd: string;
  };
  apiNote: string;
  kpis: U9Kpi[];
  earnComposition: U9EarnLine[];
  totalEarned: string;
  burnMix: U9BurnSegment[];
  engagement: U9EngagementMetric[];
  workspaceDetails: U9WorkspaceDetail[];
};

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function formatSubscribers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function formatNumber(n: number, compact = false): string {
  if (compact && n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (compact && n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US").format(n);
}

/** @deprecated use getWorkspaceAnalytics */
export function getU9Analytics(): U9Analytics {
  return getWorkspaceAnalytics("u9");
}

export function getWorkspaceAnalytics(id: WorkspaceId = "u9"): U9Analytics {
  const U9 = getWorkspace(id);
  const w = U9.workspace;
  return {
    workspace: {
      id: w.id,
      code: w.code,
      name: w.name,
      country: w.country,
      flag: w.flag,
      tier: w.tier,
      status: w.status,
      subscribers: formatSubscribers(w.subscribers),
      mrr: w.mrr > 0 ? `$${formatNumber(w.mrr, true)}` : "$0",
      contractEnd: w.contractEnd,
    },
    apiNote: U9.apiNote,
    kpis: [
      { label: "DAU", value: fmtCompact(U9.dau), subtitle: "avg unique users / day" },
      { label: "MAU", value: fmtCompact(U9.mau), subtitle: "rolling 30-day actives" },
      {
        label: "BNRY EARNED (30D)",
        value: fmtCompact(U9.bnryEarned30d),
        subtitle: "tokens issued",
      },
      {
        label: "BNRY REDEEMED (30D)",
        value: fmtCompact(U9.bnryRedeemed30d),
        subtitle: "tokens burned",
      },
      {
        label: "EARN / BURN",
        value: `${U9.earnBurnRatio}x`,
        subtitle: "health > 1.0 = healthy",
      },
      {
        label: "NET HELD / USER",
        value: String(U9.netBnryPerUser),
        subtitle: "BNRY per active user",
      },
      {
        label: "EMART TX (30D)",
        value: String(U9.emartTx30d),
        subtitle: "commerce volume",
      },
      {
        label: "STW WINNERS (30D)",
        value: fmtCompact(U9.stwWinners30d),
        subtitle: "win events",
      },
    ],
    earnComposition: [
      { label: "BNRY · Video", value: fmtCompact(U9.earn.video) },
      { label: "BNRY · Quest", value: fmtCompact(U9.earn.quest) },
      { label: "BNRY · STW", value: fmtCompact(U9.earn.stw) },
      { label: "BNRY · Screen Time", value: fmtCompact(U9.earn.screenTime) },
      { label: "BNRY · Topup", value: String(U9.earn.topup) },
    ],
    totalEarned: fmtCompact(U9.bnryEarned30d),
    burnMix: [
      {
        label: "Access pass",
        percent: U9.burn.accessPass.percent,
        volume: U9.burn.accessPass.volume,
        color: "#8b6914",
      },
      {
        label: "eMart spend",
        percent: U9.burn.emartSpend.percent,
        volume: U9.burn.emartSpend.volume,
        color: "#7c5cbf",
      },
    ],
    engagement: [
      { label: "Homepage views / user", value: String(U9.engagement.homepageViewsPerUser) },
      { label: "Avg session time", value: `${U9.engagement.avgSessionSeconds}s` },
      { label: "Game clicks / user", value: `${U9.engagement.gameClicksPerUser.toFixed(2)}x` },
      {
        label: "STW rewards / click",
        value: `${U9.engagement.stwRewardsPerClick}x`,
      },
      {
        label: "Repeat session multiplier",
        value: `${U9.engagement.repeatSessionMultiplier}x`,
      },
      {
        label: "DAU / MAU stickiness",
        value: `${U9.engagement.dauMauStickiness}%`,
      },
    ],
    workspaceDetails: [
      { label: "Workspace ID", value: w.id },
      { label: "Code", value: w.code },
      { label: "Country", value: w.country },
      { label: "Tier", value: w.tier },
      { label: "Status", value: w.status },
      { label: "Subscribers", value: formatSubscribers(w.subscribers) },
      { label: "MRR", value: w.mrr > 0 ? `$${formatNumber(w.mrr, true)}` : "$0" },
      { label: "Contract end", value: w.contractEnd },
    ],
  };
}

export { getWorkspace, getEarnChannels, WORKSPACES };
export type { WorkspaceId, WorkspaceMetrics };
