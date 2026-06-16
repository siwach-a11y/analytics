import { serverResumeSession } from "@/lib/ticket-sniper/server";

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { action, otp } = await req.json();
    const result = await serverResumeSession(
      params.token,
      action,
      otp
    );
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to resume session";
    return Response.json({ error: message }, { status: 500 });
  }
}
