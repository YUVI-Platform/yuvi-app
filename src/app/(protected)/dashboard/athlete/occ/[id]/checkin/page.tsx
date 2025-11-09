// import AthleteCheckinClient from "./AthleteCheckinClient";
// import CheckinClient from "./CheckinClient";

// export default async function Page({
//   params,
//   searchParams,
// }: {
//   params: Promise<{ id: string }>;
//   searchParams?: Promise<Record<string, string | string[] | undefined>>;
// }) {
//   const { id } = await params;
//   const sp = (await searchParams) ?? {};
//   const code = typeof sp.code === "string" ? sp.code : "";

//   return (
//     <>
//       <AthleteCheckinClient occurrenceId={id} initialCode={code} />
//       <CheckinClient occurrenceId={id} initialCode={code} />
//     </>
//   );
// }

// src/app/(protected)/dashboard/motionexpert/occ/[id]/checkin/page.tsx
import {
  supabaseServerRead,
  supabaseServerAction,
  absoluteUrl,
} from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import CheckinClient from "./CheckinClient";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id: occId } = await params;
  const sp = await searchParams;
  const refresh = String(sp?.refresh ?? "") === "1";

  const supaRead = await supabaseServerRead();
  const { data: me } = await supaRead.auth.getUser();
  if (!me?.user) {
    redirect(`/login?redirectTo=/dashboard/motionexpert/occ/${occId}/checkin`);
  }

  // OPTIONAL: Rolle prüfen (falls du eine Policy/RPC hast)
  // const { data: isExpert } = await supaRead.rpc("is_role", { role_text: "motionExpert" });
  // if (!isExpert) redirect("/dashboard");

  // QR-Token erzeugen/erneuern (Server Action Client wegen Write)
  const supaWrite = await supabaseServerAction();
  const { data: tokenRows, error: tokenErr } = await supaWrite.rpc(
    "open_checkin_window",
    {
      p_occurrence: occId,
      p_ttl_minutes: 10,
      p_max_uses: 200,
    }
  );

  if (tokenErr || !tokenRows?.[0]) {
    return (
      <div className="p-4 text-sm text-rose-600">
        Konnte Check-in-Code nicht erzeugen:{" "}
        {tokenErr?.message ?? "Unbekannter Fehler"}
      </div>
    );
  }

  const { token, expires_at } = tokenRows[0];
  const qrUrl = await absoluteUrl(
    `/dashboard/athlete/occ/${occId}/checkin?code=${encodeURIComponent(token)}`
  );

  // Initiale Buchungen laden (2-Step: bookings -> profiles)
  const { data: bookings } = await supaRead
    .from("bookings")
    .select("id, athlete_user_id, status, payment, checked_in_at")
    .eq("occurrence_id", occId);

  const ids = Array.from(
    new Set((bookings ?? []).map((b) => b.athlete_user_id))
  ).filter(Boolean);
  const profiles: Record<string, { name: string; avatar_url: string | null }> =
    {};
  if (ids.length) {
    const { data: profs } = await supaRead
      .from("profiles")
      .select("user_id, name, avatar_url")
      .in("user_id", ids);
    for (const p of profs ?? [])
      profiles[p.user_id] = { name: p.name, avatar_url: p.avatar_url };
  }

  const initialBookings = (bookings ?? []).map((b) => ({
    ...b,
    profile: profiles[b.athlete_user_id] ?? {
      name: b.athlete_user_id,
      avatar_url: null,
    },
  }));

  return (
    <CheckinClient
      occId={occId}
      qrUrl={qrUrl}
      token={token}
      expiresAt={expires_at}
      initialBookings={initialBookings}
    />
  );
}
