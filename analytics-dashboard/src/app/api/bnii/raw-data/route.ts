import { NextResponse } from "next/server";
import {
  fetchRawDataPlatformSnapshot,
  fetchRawDataSummary,
} from "@/lib/bnii/raw-data-service";
import { isBniiRawDataWorkspace } from "@/lib/bnii/raw-data-countries";
import type { WorkspaceId } from "@/data/workspaces";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";

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

  if (!isBniiRawDataWorkspace(workspace)) {
    return NextResponse.json(
      {
        error:
          "This workspace is not in raw data. Supported countries: Myanmar, Indonesia, Sri Lanka, Vietnam.",
      },
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
