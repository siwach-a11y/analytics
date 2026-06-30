import type { WorkspaceId } from "@/data/workspaces";

/** Countries included in BNII Raw Data (Thailand excluded — not on API) */
export const BNII_RAW_DATA_WORKSPACE_IDS = ["u9", "u5", "u7", "u8"] as const satisfies readonly WorkspaceId[];

export type BniiRawDataWorkspaceId = (typeof BNII_RAW_DATA_WORKSPACE_IDS)[number];

export function isBniiRawDataWorkspace(id: string): id is BniiRawDataWorkspaceId {
  return (BNII_RAW_DATA_WORKSPACE_IDS as readonly string[]).includes(id);
}

export function defaultBniiRawDataWorkspace(): BniiRawDataWorkspaceId {
  return "u9";
}
