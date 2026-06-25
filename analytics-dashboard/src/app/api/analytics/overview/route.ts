import { NextResponse } from "next/server";
import { getAnalyticsOverview } from "@/lib/analytics";

export async function GET() {
  await new Promise((r) => setTimeout(r, 80));
  return NextResponse.json(getAnalyticsOverview());
}
