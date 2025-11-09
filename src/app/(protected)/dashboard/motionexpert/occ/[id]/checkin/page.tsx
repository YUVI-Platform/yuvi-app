import { headers } from "next/headers";
import { supabaseServerRead } from "@/lib/supabaseServer";
import { openCheckinWindowAction } from "./actions";
import CheckinClient from "./CheckinClient";

function originFromHeaders(h: Headers) {
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: occId } = await params;

  const supa = await supabaseServerRead();

  // 1) initiale Buchungen holen (RLS muss den MotionExpert dafür zulassen)
  const { data: bookings } = await supa
    .from("bookings")
    .select("id, athlete_user_id, status, payment, checked_in_at")
    .eq("occurrence_id", occId)
    .neq("status", "cancelled");

  // 2) zugehörige Profile holen und mergen
  const athleteIds = Array.from(
    new Set((bookings ?? []).map((b) => b.athlete_user_id))
  );
  const profilesMap: Record<
    string,
    { name: string; avatar_url: string | null }
  > = {};
  if (athleteIds.length) {
    const { data: profs } = await supa
      .from("profiles")
      .select("user_id, name, avatar_url")
      .in("user_id", athleteIds);

    for (const p of profs ?? []) {
      profilesMap[p.user_id] = { name: p.name, avatar_url: p.avatar_url };
    }
  }

  const initialBookings =
    (bookings ?? []).map((b) => ({
      ...b,
      profile: profilesMap[b.athlete_user_id] ?? {
        name: b.athlete_user_id,
        avatar_url: null,
      },
    })) ?? [];

  // 3) Check-in Fenster/Token erstellen
  const result = await openCheckinWindowAction(occId, 10, null);
  if (!result) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p>Kein Code erzeugt.</p>
      </div>
    );
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL || originFromHeaders(await headers());
  const qrUrl = `${base}/dashboard/athlete/occ/${occId}/checkin?code=${encodeURIComponent(
    result.token
  )}`;

  // 4) An Client übergeben
  return (
    <CheckinClient
      occId={occId}
      qrUrl={qrUrl}
      token={result.token}
      expiresAt={result.expires_at}
      initialBookings={initialBookings}
    />
  );
}
