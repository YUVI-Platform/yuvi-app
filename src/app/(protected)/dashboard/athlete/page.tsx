// src/app/(protected)/dashboard/athlete/page.tsx
import "server-only";
import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import DashboardClient from "./ui/DashboardClient";

export default async function AthleteDashboardPage() {
  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) redirect("/login?redirectTo=/dashboard/athlete");

  const nowIso = new Date().toISOString();

  // 1) Meine künftigen Buchungen
  const { data: myBookings } = await supa
    .from("bookings")
    .select("id, occurrence_id, status, session_occurrences(starts_at)")
    .eq("athlete_user_id", uid);

  const futureMyBookings = (myBookings ?? []).filter((b: any) => {
    const starts = b?.session_occurrences?.starts_at;
    return (
      starts &&
      new Date(starts).toISOString() >= nowIso &&
      b.status !== "cancelled"
    );
  });

  // occurrenceId -> bookingId (für initialBookingId)
  const myBookingIdByOcc = new Map<string, string>();
  for (const b of futureMyBookings) {
    if (!myBookingIdByOcc.has(b.occurrence_id)) {
      myBookingIdByOcc.set(b.occurrence_id, b.id);
    }
  }
  const myOccIds = [...myBookingIdByOcc.keys()];
  const myOccIdSet = new Set(myOccIds);

  // Gemeinsame Select-Liste
  const baseSelect = `
    id, starts_at, ends_at, capacity,
    sessions (
      id, title, image_urls, session_type, price_cents, tags, location_type, expert_user_id,
      expert:profiles!sessions_expert_profile_fk ( user_id, name, avatar_url )
    ),
    studio_slots (
      id, capacity,
      studio_locations ( id, title, address, image_urls, max_participants )
    )
  `;

  // 2) Meine Occurrences
  const { data: myOccsRaw, error: myErr } = myOccIds.length
    ? await supa
        .from("session_occurrences")
        .select(baseSelect)
        .in("id", myOccIds)
        .order("starts_at", { ascending: true })
    : { data: [] as any[], error: null };
  if (myErr) throw new Error(`myOccs error: ${myErr.message}`);

  // 3) Kommende Occurrences (alle)
  const { data: upcomingRaw, error: upErr } = await supa
    .from("session_occurrences")
    .select(baseSelect)
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(500);
  if (upErr) throw new Error(`upcoming error: ${upErr.message}`);

  // Available = kommende ohne MEINE gebuchten O-IDs (keine Session-Filter!)
  const recommendedRaw = (upcomingRaw ?? []).filter(
    (o: any) => !myOccIdSet.has(o.id)
  );

  const softlaunchRows = recommendedRaw.filter((o: any) =>
    String(o.sessions?.title ?? "")
      .toLowerCase()
      .includes("softlaunch")
  );

  // 4) Buchungs-Counts
  const occIdsAll = Array.from(
    new Set([
      ...(myOccsRaw ?? []).map((o: any) => o.id),
      ...recommendedRaw.map((o: any) => o.id),
    ])
  );

  const { data: bookedRows, error: bookedErr } = occIdsAll.length
    ? await supa
        .from("bookings")
        .select("occurrence_id, status")
        .in("occurrence_id", occIdsAll)
        .neq("status", "cancelled")
    : { data: [], error: null };
  if (bookedErr) throw new Error(`bookings error: ${bookedErr.message}`);

  const bookedCountByOcc = new Map<string, number>();
  for (const r of bookedRows ?? []) {
    bookedCountByOcc.set(
      r.occurrence_id,
      (bookedCountByOcc.get(r.occurrence_id) ?? 0) + 1
    );
  }

  // 5) Experten
  function collectExpertIds(rows: any[] = []) {
    const set = new Set<string>();
    for (const o of rows) {
      const id = o?.sessions?.expert_user_id;
      if (id && typeof id === "string") set.add(id);
    }
    return Array.from(set);
  }
  const expertIds = Array.from(
    new Set([
      ...collectExpertIds(myOccsRaw || []),
      ...collectExpertIds(recommendedRaw || []),
    ])
  );

  const { data: expertProfiles, error: profErr } = expertIds.length
    ? await supa
        .from("profiles")
        .select("user_id, name, alias, avatar_url")
        .in("user_id", expertIds)
    : { data: [], error: null };
  if (profErr) throw new Error(`profiles error: ${profErr.message}`);

  const expertById = new Map<
    string,
    { name: string | null; avatar_url: string | null }
  >(
    (expertProfiles ?? []).map((p) => [
      p.user_id,
      { name: p.name ?? p.alias ?? null, avatar_url: p.avatar_url ?? null },
    ])
  );

  // Ratings
  const { data: expertRatings, error: rateErr } = expertIds.length
    ? await supa
        .from("motion_expert_profiles")
        .select("user_id, rating_avg, rating_count")
        .in("user_id", expertIds)
    : { data: [], error: null };
  if (rateErr) throw new Error(`ratings error: ${rateErr.message}`);

  const ratingById = new Map<
    string,
    { rating_avg: number | null; rating_count: number | null }
  >(
    (expertRatings ?? []).map((r) => [
      r.user_id,
      {
        rating_avg: r.rating_avg ?? null,
        rating_count: r.rating_count ?? null,
      },
    ])
  );

  // 6) Mapper
  const mapOcc = (o: any) => ({
    id: o.id as string,
    starts_at: o.starts_at as string,
    ends_at: o.ends_at as string,
    capacity: o.capacity ?? null,
    booked_count: bookedCountByOcc.get(o.id) ?? 0,
    sessions: o.sessions
      ? {
          id: o.sessions.id as string,
          title: (o.sessions.title ?? null) as string | null,
          image_urls: (o.sessions.image_urls ?? null) as string[] | null,
          session_type: (o.sessions.session_type ?? null) as string | null,
          price_cents: (o.sessions.price_cents ?? null) as number | null,
          tags: (o.sessions.tags ?? null) as string[] | null,
          location_type: (o.sessions.location_type ?? null) as string | null,
          expert: (() => {
            const eid = o.sessions.expert_user_id as string | null;
            if (!eid) return null;
            const prof = expertById.get(eid);
            const rat = ratingById.get(eid);
            return prof
              ? {
                  name: prof.name,
                  avatar_url: prof.avatar_url,
                  rating_avg: rat?.rating_avg ?? null,
                  rating_count: rat?.rating_count ?? null,
                }
              : null;
          })(),
        }
      : null,
    studio_slots: o.studio_slots
      ? {
          id: o.studio_slots.id as string,
          capacity: (o.studio_slots.capacity ?? null) as number | null,
          studio_locations: o.studio_slots.studio_locations
            ? {
                id: o.studio_slots.studio_locations.id as string,
                title: (o.studio_slots.studio_locations.title ?? null) as
                  | string
                  | null,
                address: (o.studio_slots.studio_locations.address ??
                  null) as Record<string, unknown> | null,
                image_urls: (o.studio_slots.studio_locations.image_urls ??
                  null) as string[] | null,
                max_participants: (o.studio_slots.studio_locations
                  .max_participants ?? null) as number | null,
              }
            : null,
        }
      : null,
    initialBookingId: (myBookingIdByOcc.get(o.id) ?? null) as string | null,
  });

  const myOccurrences = (myOccsRaw ?? []).map(mapOcc);
  const recommended = (recommendedRaw ?? []).map(mapOcc);

  return (
    <DashboardClient myOccurrences={myOccurrences} recommended={recommended} />
  );
}
//TODO: SESSONS muss anders heiße zum beispiel EVENT wording macht keinen sinn die occs sind eingentlich die sessions
