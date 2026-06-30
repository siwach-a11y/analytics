import type { WorkspaceId } from "@/data/workspaces";

/** Raw data countries on the BNII Analytics API — Myanmar, Indonesia, Sri Lanka, Vietnam */
export const BNII_RAW_DATA_WORKSPACE_IDS = ["u9", "u5", "u7", "u8"] as const satisfies readonly WorkspaceId[];

export type BniiRawDataWorkspaceId = (typeof BNII_RAW_DATA_WORKSPACE_IDS)[number];

/** Display order on the Raw Data page */
export const RAW_DATA_WORKSPACE_ORDER: BniiRawDataWorkspaceId[] = ["u7", "u5", "u8", "u9"];

export function isBniiRawDataWorkspace(id: string): id is BniiRawDataWorkspaceId {
  return (BNII_RAW_DATA_WORKSPACE_IDS as readonly string[]).includes(id);
}

export function defaultBniiRawDataWorkspace(): BniiRawDataWorkspaceId {
  return "u9";
}

export function isBniiDataFeedWorkspace(workspaceId: WorkspaceId): boolean {
  return isBniiRawDataWorkspace(workspaceId);
}

export const RAW_DATA_COUNTRY_NAMES = [
  "Myanmar",
  "Indonesia",
  "Sri Lanka",
  "Vietnam",
] as const;
