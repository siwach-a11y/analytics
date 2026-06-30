import { WORKSPACE_IDS, WORKSPACES, type WorkspaceId } from "@/data/workspaces";

/**
 * The nine telco partners live on the BNII Analytics API. All current workspaces
 * are BNII partners (globe / ioh / ethio, which have no partner, are not modelled).
 */
export const BNII_RAW_DATA_WORKSPACE_IDS = WORKSPACE_IDS;

export type BniiRawDataWorkspaceId = WorkspaceId;

/** Display order on the Raw Data page — real-data telcos first, then pilots. */
export const RAW_DATA_WORKSPACE_ORDER: BniiRawDataWorkspaceId[] = [
  "dialog",
  "telkomsel",
  "banglalink",
  "robi-myairtel",
  "u9",
  "gopay",
  "bima",
  "myim3",
  "okara",
];

export function isBniiRawDataWorkspace(id: string): id is BniiRawDataWorkspaceId {
  return id in WORKSPACES;
}

export function defaultBniiRawDataWorkspace(): BniiRawDataWorkspaceId {
  return "u9";
}

export function isBniiDataFeedWorkspace(workspaceId: WorkspaceId): boolean {
  return isBniiRawDataWorkspace(workspaceId);
}

/** Unique countries represented across the nine telco partners. */
export const RAW_DATA_COUNTRY_NAMES = Array.from(
  new Set(RAW_DATA_WORKSPACE_ORDER.map((id) => WORKSPACES[id].workspace.country))
);

/** Telco partner display names, in Raw Data page order. */
export const RAW_DATA_PARTNER_NAMES = RAW_DATA_WORKSPACE_ORDER.map(
  (id) => WORKSPACES[id].workspace.name
);
