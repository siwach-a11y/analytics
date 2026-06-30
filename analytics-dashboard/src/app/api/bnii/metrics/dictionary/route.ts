import { NextResponse } from "next/server";
import { fetchBniiMetricsDictionaryServer } from "@/lib/api-plugin/bnii-api";

export async function GET() {
  const dictionary = await fetchBniiMetricsDictionaryServer();
  return NextResponse.json(dictionary);
}
