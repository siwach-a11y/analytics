import { serverCancelHunt } from "@/lib/ticket-sniper/server";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await serverCancelHunt(params.id);
    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel hunt";
    return Response.json({ error: message }, { status: 500 });
  }
}
