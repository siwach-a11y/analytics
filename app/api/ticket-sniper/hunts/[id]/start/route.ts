import { serverStartHunt } from "@/lib/ticket-sniper/server";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await serverStartHunt(params.id);
    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start hunt";
    return Response.json({ error: message }, { status: 500 });
  }
}
