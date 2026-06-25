import { NextResponse } from "next/server";
import { getCustomerIntelligence } from "@/data/customer-intelligence";
import type { WorkspaceId } from "@/data/workspaces";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspace = (searchParams.get("workspace") ?? "u9") as WorkspaceId;
  const data = getCustomerIntelligence(workspace);
  return NextResponse.json(data);
}
