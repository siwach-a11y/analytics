import { getWorkspace } from "@/data/workspaces";
import type { BniiRawDataWorkspaceId } from "@/lib/bnii/raw-data-countries";
import { isBniiRawDataWorkspace } from "@/lib/bnii/raw-data-countries";

export type BniiPartnerConfig = {
  partnerId: string;
  brandLabel: string;
};

const ENV_PARTNER_KEYS: Record<BniiRawDataWorkspaceId, string> = {
  u9: "NEXT_PUBLIC_BNII_PARTNER_ID_U9",
  u5: "NEXT_PUBLIC_BNII_PARTNER_ID_U5",
  u7: "NEXT_PUBLIC_BNII_PARTNER_ID_U7",
  u8: "NEXT_PUBLIC_BNII_PARTNER_ID_U8",
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
