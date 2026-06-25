import { NextResponse } from "next/server";
import { getEngagementAnalytics } from "@/lib/analytics";

export async function GET() {
  await new Promise((r) => setTimeout(r, 100));
  return NextResponse.json(getEngagementAnalytics());
}
