import SessionPageClient from "./SessionPageClient";

export function generateStaticParams() {
  return [{ token: "handoff" }];
}

export default function SessionPage({ params }: { params: { token: string } }) {
  return <SessionPageClient token={params.token} />;
}
