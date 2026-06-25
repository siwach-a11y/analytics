import { NextResponse } from "next/server";
import { getCustomerAnalytics } from "@/data/customer-analytics";

export async function GET() {
  await new Promise((r) => setTimeout(r, 100));
  return NextResponse.json(getCustomerAnalytics());
}
