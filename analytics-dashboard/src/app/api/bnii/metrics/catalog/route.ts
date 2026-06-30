import { NextResponse } from "next/server";
import { fetchBniiMetricsCatalogServer } from "@/lib/api-plugin/bnii-api";

export async function GET() {
  const catalog = await fetchBniiMetricsCatalogServer();
  return NextResponse.json(catalog);
}
