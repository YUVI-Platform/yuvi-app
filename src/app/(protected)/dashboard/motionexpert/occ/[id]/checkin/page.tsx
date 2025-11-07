import { headers } from "next/headers";
import { openCheckinWindowAction } from "./actions";
import CheckinClient from "./CheckinClient";

function originFromHeaders(h: Headers) {
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: occurrenceId } = await params;

  // neuen Token anfordern (jede Ansicht generiert frisches Fenster)
  const result = await openCheckinWindowAction(occurrenceId, 10, null);
  if (!result) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p>Kein Code erzeugt.</p>
      </div>
    );
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL || originFromHeaders(await headers());
  const qrUrl = `${base}/dashboard/athlete/occ/${occurrenceId}/checkin?code=${encodeURIComponent(
    result.token
  )}`;

  return (
    <CheckinClient
      qrUrl={qrUrl}
      token={result.token}
      expiresAt={result.expires_at}
    />
  );
}
