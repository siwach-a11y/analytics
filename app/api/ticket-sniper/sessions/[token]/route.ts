import { serverFetchSession } from "@/lib/ticket-sniper/server";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const data = await serverFetchSession(params.token);
    return Response.json(data);
  } catch {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
}
