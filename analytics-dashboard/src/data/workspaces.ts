import { U9 } from "./u9-constants";

/**
 * The nine BNII Analytics API telco partners (Atlas WORKSPACE_TO_PARTNER set).
 * Slugs match Atlas (atlas-prod/app/services/bnii_ingest.py). Each workspace has
 * a partner UUID resolved at runtime from env (see lib/bnii/partners.ts); none
 * are committed to source. globe / ioh / ethio are intentionally absent — they
 * have no BNII partner and would render "—" everywhere.
 */
export type WorkspaceId =
  | "u9"
  | "dialog"
  | "telkomsel"
  | "banglalink"
  | "robi-myairtel"
  | "gopay"
  | "bima"
  | "myim3"
  | "okara";

export const WORKSPACE_IDS: WorkspaceId[] = [
  "u9",
  "dialog",
  "telkomsel",
  "banglalink",
  "robi-myairtel",
  "gopay",
  "bima",
  "myim3",
  "okara",
];

export type WorkspaceMetrics = {
  workspace: {
    id: WorkspaceId;
    code: string;
    name: string;
    country: string;
    flag: string;
    tier: string;
    status: string;
    subscribers: number;
    mrr: number;
    contractEnd: string;
  };
  /** Telco brand name as reported by the BNII API (results[].telco_name). */
  telcoName: string;
  region: string;
  /**
   * "real" when the workspace is wired to a live BNII partner feed; "projected"
   * when the displayed numbers are config baselines until the feed is connected.
   * Per-field provenance is still decided at query time (live → value, else —).
   */
  dataMode: "real" | "projected";
  dau: number;
  mau: number;
  bnryEarned30d: number;
  bnryRedeemed30d: number;
  earnBurnRatio: number;
  netBnryPerUser: number;
  emartTx30d: number;
  stwWinners30d: number;
  earn: {
    video: number;
    quest: number;
    stw: number;
    screenTime: number;
    topup: number;
  };
  burn: {
    accessPass: { volume: number; percent: number };
    emartSpend: { volume: number; percent: number };
  };
  engagement: {
    homepageViewsPerUser: number;
    avgSessionSeconds: number;
    gameClicksPerUser: number;
    stwRewardsPerClick: number;
    repeatSessionMultiplier: number;
    dauMauStickiness: number;
  };
  apiNote: string;
  /** Raw Data page brand (e.g. Okara for Vietnam) */
  rawDataBrand: string;
  /** How many of 28 raw data fields are live for this country */
  rawDataLiveFields: number;
  /** Field IDs not yet exposed for this workspace platform */
  rawDataUnavailableFields?: string[];
};

type WorkspaceSeed = {
  id: Exclude<WorkspaceId, "u9">;
  code: string;
  name: string;
  country: string;
  region: string;
  flag: string;
  tier: string;
  subscribers: number;
  /** 30-day BNRY issued — used to derive the earn/burn baseline. */
  bnryEarned30d: number;
  /** Average session seconds (BNII-sourced figure where known). */
  avgSessionSeconds: number;
  dataMode: "real" | "projected";
  rawDataLiveFields?: number;
  rawDataUnavailableFields?: string[];
};

/**
 * Build a projected WorkspaceMetrics baseline from a few seed inputs so the nine
 * entries stay consistent without nine hand-written literals. The live BNII feed
 * overwrites these per-field at query time; until then they are the "projected"
 * config baseline (never styled as real — see lib/bnii/format-raw-value.ts).
 */
function buildWorkspace(seed: WorkspaceSeed): WorkspaceMetrics {
  const mau = Math.round(seed.subscribers * 0.06);
  const dau = Math.round(mau * 0.033);
  const bnryRedeemed30d = Math.round(seed.bnryEarned30d * 0.13);
  const earnBurnRatio = Math.round((seed.bnryEarned30d / Math.max(bnryRedeemed30d, 1)) * 100) / 100;
  const stwWinners30d = Math.round(mau * 0.3);
  const earn = {
    video: Math.round(seed.bnryEarned30d * 0.02),
    quest: Math.round(seed.bnryEarned30d * 0.08),
    stw: Math.round(seed.bnryEarned30d * 0.82),
    screenTime: Math.round(seed.bnryEarned30d * 0.08),
    topup: 0,
  };
  const accessPassVol = Math.round(bnryRedeemed30d * 0.97);
  const emartSpendVol = bnryRedeemed30d - accessPassVol;

  return {
    workspace: {
      id: seed.id,
      code: seed.code,
      name: seed.name,
      country: seed.country,
      flag: seed.flag,
      tier: seed.tier,
      status: "Active",
      subscribers: seed.subscribers,
      mrr: 0,
      contractEnd: "Ongoing",
    },
    telcoName: seed.name,
    region: seed.region,
    dataMode: seed.dataMode,
    dau,
    mau,
    bnryEarned30d: seed.bnryEarned30d,
    bnryRedeemed30d,
    earnBurnRatio,
    netBnryPerUser: Math.round((seed.bnryEarned30d / Math.max(mau, 1)) * 10) / 10,
    emartTx30d: 0,
    stwWinners30d,
    earn,
    burn: {
      accessPass: { volume: accessPassVol, percent: 97 },
      emartSpend: { volume: emartSpendVol, percent: 3 },
    },
    engagement: {
      homepageViewsPerUser: 1.8,
      avgSessionSeconds: seed.avgSessionSeconds,
      gameClicksPerUser: 0,
      stwRewardsPerClick: 80,
      repeatSessionMultiplier: 0.08,
      dauMauStickiness: Math.round((dau / Math.max(mau, 1)) * 1000) / 10,
    },
    apiNote: `${seed.name} · ${seed.country} · BNII Analytics API. Behavioural metrics live from BNII; fields BNII doesn't expose render as —.`,
    rawDataBrand: seed.name,
    rawDataLiveFields: seed.rawDataLiveFields ?? 24,
    rawDataUnavailableFields: seed.rawDataUnavailableFields,
  };
}

/**
 * Config baselines (subscribers / 30d BNRY earned / avg session) seeded from the
 * Atlas User Universe view. Real per-field values arrive from the live BNII feed.
 */
const WORKSPACE_SEEDS: WorkspaceSeed[] = [
  {
    id: "dialog", code: "DLG", name: "Dialog Axiata", country: "Sri Lanka",
    region: "South Asia", flag: "🇱🇰", tier: "Standard",
    subscribers: 17_000_000, bnryEarned30d: 1_500_000, avgSessionSeconds: 101,
    dataMode: "real", rawDataLiveFields: 27,
  },
  {
    id: "telkomsel", code: "TKM", name: "Telkomsel", country: "Indonesia",
    region: "Southeast Asia", flag: "🇮🇩", tier: "Enterprise",
    subscribers: 159_100_000, bnryEarned30d: 2_700_000, avgSessionSeconds: 99,
    dataMode: "real", rawDataLiveFields: 26,
  },
  {
    id: "banglalink", code: "BLK", name: "Banglalink", country: "Bangladesh",
    region: "South Asia", flag: "🇧🇩", tier: "Standard",
    subscribers: 37_000_000, bnryEarned30d: 1_900_000, avgSessionSeconds: 130,
    dataMode: "real", rawDataLiveFields: 26,
  },
  {
    id: "robi-myairtel", code: "ROBI", name: "Robi (My Airtel)", country: "Bangladesh",
    region: "South Asia", flag: "🇧🇩", tier: "Standard",
    subscribers: 57_000_000, bnryEarned30d: 254_500, avgSessionSeconds: 81,
    dataMode: "real", rawDataLiveFields: 25,
  },
  {
    id: "gopay", code: "GOPAY", name: "GoPay", country: "Indonesia",
    region: "Southeast Asia", flag: "🇮🇩", tier: "Standard",
    subscribers: 20_000_000, bnryEarned30d: 121_100, avgSessionSeconds: 89,
    dataMode: "real", rawDataLiveFields: 24,
  },
  {
    id: "bima", code: "BIMA", name: "Bima", country: "Indonesia",
    region: "Southeast Asia", flag: "🇮🇩", tier: "Pilot",
    subscribers: 100_000_000, bnryEarned30d: 7_900, avgSessionSeconds: 154,
    dataMode: "projected", rawDataLiveFields: 22,
  },
  {
    id: "myim3", code: "MYIM3", name: "MyIM3", country: "Indonesia",
    region: "Southeast Asia", flag: "🇮🇩", tier: "Pilot",
    subscribers: 100_000_000, bnryEarned30d: 10_200, avgSessionSeconds: 97,
    dataMode: "projected", rawDataLiveFields: 22,
  },
  {
    id: "okara", code: "OKARA", name: "Okara", country: "Pakistan",
    region: "South Asia", flag: "🇵🇰", tier: "Pilot",
    subscribers: 1_000_000, bnryEarned30d: 7_700, avgSessionSeconds: 47,
    dataMode: "projected", rawDataLiveFields: 22,
  },
];

const U9_WORKSPACE: WorkspaceMetrics = {
  ...U9,
  workspace: { ...U9.workspace },
  earn: { ...U9.earn },
  burn: {
    accessPass: { ...U9.burn.accessPass },
    emartSpend: { ...U9.burn.emartSpend },
  },
  engagement: { ...U9.engagement },
  telcoName: "U9",
  region: "Southeast Asia",
  dataMode: "real",
};

export const WORKSPACES: Record<WorkspaceId, WorkspaceMetrics> = {
  u9: U9_WORKSPACE,
  ...Object.fromEntries(
    WORKSPACE_SEEDS.map((seed) => [seed.id, buildWorkspace(seed)])
  ),
} as Record<WorkspaceId, WorkspaceMetrics>;

export const WORKSPACE_OPTIONS = WORKSPACE_IDS.map((id) => {
  const w = WORKSPACES[id].workspace;
  return {
    id,
    code: w.code,
    country: w.country,
    flag: w.flag,
    label: `${w.flag} ${w.name}`,
    tier: w.tier,
  };
});

export function getWorkspace(id: WorkspaceId): WorkspaceMetrics {
  return WORKSPACES[id];
}

export function getEarnChannels(workspace: WorkspaceMetrics) {
  return [
    {
      id: "telkomsel" as const,
      name: "STW Rewards",
      country: workspace.workspace.country,
      marketShare: 82.6,
      activeWallets: Math.round(workspace.mau * 0.56),
      transactions: workspace.earn.stw,
      growthPercent: 12.4,
      retention: 78.2,
      newUsers: Math.round(workspace.stwWinners30d * 0.25),
      color: "#8b6914",
      logo: "STW",
    },
    {
      id: "indosat" as const,
      name: "Quest",
      country: workspace.workspace.country,
      marketShare: 7.8,
      activeWallets: Math.round(workspace.mau * 0.3),
      transactions: workspace.earn.quest,
      growthPercent: 8.1,
      retention: 71.5,
      newUsers: Math.round(workspace.mau * 0.035),
      color: "#2d6a4f",
      logo: "Q",
    },
    {
      id: "globe" as const,
      name: "Screen Time",
      country: workspace.workspace.country,
      marketShare: 9.2,
      activeWallets: Math.round(workspace.mau * 0.2),
      transactions: workspace.earn.screenTime,
      growthPercent: 5.6,
      retention: 68.4,
      newUsers: Math.round(workspace.mau * 0.024),
      color: "#7c5cbf",
      logo: "SC",
    },
  ];
}

/** @deprecated use getEarnChannels(getWorkspace("u9")) */
export const U9_EARN_CHANNELS = getEarnChannels(U9_WORKSPACE);
