import { NextResponse } from "next/server";
import {
  fetchRawDataPlatformSnapshot,
  fetchRawDataSummary,
  fetchTelecomRawDataSummary,
} from "@/lib/bnii/raw-data-service";
import {
  isBniiRawDataWorkspace,
  isTelecomRawDataWorkspace,
} from "@/lib/bnii/raw-data-countries";
import type { WorkspaceId } from "@/data/workspaces";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";
  const platform = searchParams.get("platform");

  if (all) {
    try {
      const snapshot = await fetchRawDataPlatformSnapshot();
      return NextResponse.json(snapshot);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Raw data fetch failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const workspace = (searchParams.get("workspace") ?? "u9") as WorkspaceId;

  if (platform === "telecom" || isTelecomRawDataWorkspace(workspace)) {
    if (!isTelecomRawDataWorkspace(workspace)) {
      return NextResponse.json(
        { error: "Only telecommunications workspaces are supported for this route." },
        { status: 400 }
      );
    }
    try {
      const summary = await fetchTelecomRawDataSummary(workspace);
      return NextResponse.json(summary);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Raw data fetch failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

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
