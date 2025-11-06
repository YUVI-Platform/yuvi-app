import { supabaseServerRead } from "@/lib/supabaseServer";
import DashboardClient from "./ui/DashboardClient";

export default async function AthleteHomePage() {
  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) {
    // user is not authenticated — render an empty dashboard (or redirect as needed)
    return <DashboardClient myOccurrences={[]} recommended={[]} />;
  }

  // 🔹 Meine kommenden Buchungen (nächste 30 Tage)
  const nowIso = new Date().toISOString();
  const untilIso = new Date(Date.now() + 30 * 86400e3).toISOString();

  // Hinweis: Passe die Relationship-Namen an deine DB an, falls sie abweichen.
  const { data: myOccs } = await supa
    .from("session_occurrences")
    .select(
      `
      id, starts_at, ends_at, capacity,
      sessions (
        id, title, image_urls, session_type, price_cents, tags, location_type
      ),
      studio_slots (
        id, capacity,
        studio_locations ( id, title, address, image_urls, max_participants )
      ),
      bookings!inner ( id, user_id )
    `
    )
    .eq("bookings.user_id", uid)
    .gte("starts_at", nowIso)
    .lte("starts_at", untilIso)
    .order("starts_at", { ascending: true });

  // 🔹 Empfohlene Sessions (einfacher Fallback: kommende öffentliche Sessions ohne Buchung)
  const { data: recOccs } = await supa
    .from("session_occurrences")
    .select(
      `
      id, starts_at, ends_at,
      sessions ( id, title, image_urls, session_type, price_cents, tags, location_type )
    `
    )
    .gte("starts_at", nowIso)
    .lte("starts_at", untilIso)
    .order("starts_at", { ascending: true })
    .limit(12);

  return (
    <DashboardClient myOccurrences={myOccs ?? []} recommended={recOccs ?? []} />
  );
}
