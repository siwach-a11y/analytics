"use client";

import { useParams } from "next/navigation";
import SessionHandoff from "@/components/agents/concert/SessionHandoff";

export default function SessionPageClient({ token }: { token: string }) {
  const params = useParams();
  const resolvedToken =
    typeof params?.token === "string" ? params.token : token;
  return <SessionHandoff token={resolvedToken} />;
}
