import { NextResponse } from "next/server";
import { queryBniiMetricsServer, type BniiMetricsQueryRequest } from "@/lib/api-plugin/bnii-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BniiMetricsQueryRequest;
    const result = await queryBniiMetricsServer(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "BNII query failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
