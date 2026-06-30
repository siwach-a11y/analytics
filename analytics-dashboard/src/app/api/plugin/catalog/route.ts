import { NextResponse } from "next/server";
import { getDataFeedCatalog } from "@/lib/api-plugin/data-feeds";

export async function GET() {
  return NextResponse.json(getDataFeedCatalog());
}
