import { serverHealthCheck } from "@/lib/ticket-sniper/server";

export async function GET() {
  try {
    const result = await serverHealthCheck();
    return Response.json(result);
  } catch {
    return Response.json({ ok: false, demo: true });
  }
}
