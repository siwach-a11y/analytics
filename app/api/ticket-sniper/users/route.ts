import { serverEnsureUser } from "@/lib/ticket-sniper/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const userId = await serverEnsureUser(
      email ?? "user@agenthub.local"
    );
    return Response.json({ userId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create user";
    return Response.json({ error: message }, { status: 500 });
  }
}
