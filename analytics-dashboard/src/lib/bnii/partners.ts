import { getWorkspace } from "@/data/workspaces";
import type { BniiRawDataWorkspaceId } from "@/lib/bnii/raw-data-countries";
import { isBniiRawDataWorkspace } from "@/lib/bnii/raw-data-countries";

export type BniiPartnerConfig = {
  partnerId: string;
  brandLabel: string;
};

/**
 * Workspace slug → env var holding that telco's BNII partner UUID. UUIDs are
 * never committed to source; set them in .env.local (see .env.local.example).
 * Slugs mirror Atlas's WORKSPACE_TO_PARTNER map.
 */
const ENV_PARTNER_KEYS: Record<BniiRawDataWorkspaceId, string> = {
  u9: "NEXT_PUBLIC_BNII_PARTNER_ID_U9",
  dialog: "NEXT_PUBLIC_BNII_PARTNER_ID_DIALOG",
  telkomsel: "NEXT_PUBLIC_BNII_PARTNER_ID_TELKOMSEL",
  banglalink: "NEXT_PUBLIC_BNII_PARTNER_ID_BANGLALINK",
  "robi-myairtel": "NEXT_PUBLIC_BNII_PARTNER_ID_ROBI_MYAIRTEL",
  gopay: "NEXT_PUBLIC_BNII_PARTNER_ID_GOPAY",
  bima: "NEXT_PUBLIC_BNII_PARTNER_ID_BIMA",
  myim3: "NEXT_PUBLIC_BNII_PARTNER_ID_MYIM3",
  okara: "NEXT_PUBLIC_BNII_PARTNER_ID_OKARA",
};

function readPartnerId(workspaceId: BniiRawDataWorkspaceId): string {
  const specific = process.env[ENV_PARTNER_KEYS[workspaceId]];
  if (specific?.trim()) {
    return specific.trim();
  }
  const shared = process.env.NEXT_PUBLIC_BNII_PARTNER_ID ?? process.env.BNII_PARTNER_ID;
  return shared?.trim() ?? "";
}

export function getBniiPartner(workspaceId: BniiRawDataWorkspaceId): BniiPartnerConfig {
  const ws = getWorkspace(workspaceId);
  return {
    partnerId: readPartnerId(workspaceId),
    brandLabel: ws.rawDataBrand,
  };
}

export function getBniiPartnerIfSupported(
  workspaceId: string
): BniiPartnerConfig | null {
  if (!isBniiRawDataWorkspace(workspaceId)) {
    return null;
  }
  return getBniiPartner(workspaceId);
}
