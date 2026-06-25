import { NextResponse } from "next/server";
import { getMarketingAnalytics } from "@/data/marketing-analytics";

export async function GET() {
  await new Promise((r) => setTimeout(r, 100));
  return NextResponse.json(getMarketingAnalytics());
}
