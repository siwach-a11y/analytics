import {
  serverCreateHunt,
  serverFetchHunts,
} from "@/lib/ticket-sniper/server";
import { CreateHuntPayload } from "@/lib/ticket-sniper/types";

export async function GET(req: Request) {
  try {
    const userId = new URL(req.url).searchParams.get("userId") ?? undefined;
    const result = await serverFetchHunts(userId);
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch hunts";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateHuntPayload;
    const hunt = await serverCreateHunt(body);
    return Response.json({ hunt }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create hunt";
    return Response.json({ error: message }, { status: 500 });
  }
}
