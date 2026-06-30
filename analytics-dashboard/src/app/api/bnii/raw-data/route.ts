import { NextResponse } from "next/server";
import { fetchAllRawDataSummaries, fetchRawDataSummary } from "@/lib/bnii/raw-data-service";
import {
  isBniiRawDataWorkspace,
} from "@/lib/bnii/raw-data-countries";
import type { WorkspaceId } from "@/data/workspaces";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

  if (all) {
    try {
      const summary = await fetchAllRawDataSummaries();
      return NextResponse.json(summary);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Raw data fetch failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const workspace = (searchParams.get("workspace") ?? "u9") as WorkspaceId;

  if (!isBniiRawDataWorkspace(workspace)) {
    return NextResponse.json(
      { error: "Thailand is not available on the BNII Raw Data API." },
      { status: 400 }
    );
  }

  try {
    const summary = await fetchRawDataSummary(workspace);
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Raw data fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
