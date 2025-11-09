import { supabaseServerRead } from "@/lib/supabaseServer";
import DashboardClient from "./ui/DashboardClient";

export default async function AthleteHomePage() {
  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;

  if (!uid) {
    return <DashboardClient myOccurrences={[]} recommended={[]} />;
  }

  const nowIso = new Date().toISOString();
  const untilIso = new Date(Date.now() + 30 * 86400e3).toISOString();

  // ---- Meine kommenden Buchungen (mit inner join auf bookings) ----
  // ACHTUNG: bookings.athlete_user_id (nicht user_id)
  const { data: myOccsRaw } = await supa
    .from("session_occurrences")
    .select(
      `
      id, starts_at, ends_at, capacity,
      sessions:session_id ( id, title, image_urls, session_type, price_cents, tags, location_type ),
      studio_slots (
        id, capacity,
        studio_locations ( id, title, address, image_urls, max_participants )
      ),
      bookings!inner ( id, athlete_user_id, status )
    `
    )
    .eq("bookings.athlete_user_id", uid)
    .in("bookings.status", ["pending", "confirmed"])
    .gte("starts_at", nowIso)
    .lte("starts_at", untilIso)
    .order("starts_at", { ascending: true });

  const myOccurrences = (myOccsRaw ?? []).map((o: any) => ({
    ...o,
    initialBookingId: o.bookings?.[0]?.id ?? null, // sicher: unique constraint → max 1 aktiv
  }));

  // ---- Empfohlene Occurrences (Left-Join-Variante über 2. Query, damit auch "nicht-gebucht" bleibt) ----
  const { data: recOccsRaw } = await supa
    .from("session_occurrences")
    .select(
      `
      id, starts_at, ends_at, capacity,
      sessions:session_id ( id, title, image_urls, session_type, price_cents, tags, location_type ),
      studio_slots (
        id, capacity,
        studio_locations ( id, title, address, image_urls, max_participants )
      )
    `
    )
    .gte("starts_at", nowIso)
    .lte("starts_at", untilIso)
    .order("starts_at", { ascending: true })
    .limit(12);

  const recIds = (recOccsRaw ?? []).map((o) => o.id);
  let byOcc = new Map<string, string>();
  if (recIds.length) {
    const { data: recBookings } = await supa
      .from("bookings")
      .select("id, occurrence_id, status")
      .eq("athlete_user_id", uid)
      .in("status", ["pending", "confirmed"])
      .in("occurrence_id", recIds);

    byOcc = new Map(
      (recBookings ?? []).map((b: any) => [b.occurrence_id, b.id])
    );
  }

  const recommended = (recOccsRaw ?? []).map((o: any) => ({
    ...o,
    initialBookingId: byOcc.get(o.id) ?? null,
  }));

  return (
    <DashboardClient myOccurrences={myOccurrences} recommended={recommended} />
  );
}
