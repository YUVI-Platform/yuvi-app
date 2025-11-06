// app/(protected)/dashboard/motionexpert/sessions/page.tsx
import { supabaseServerRead } from "@/lib/supabaseServer";
import SessionsDashboardClient from "./SessionsDashboardClient";
import type { Tables, Enums } from "@/types/supabase";

function startOfDayLocal(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

type SessionRow = Pick<
  Tables<"sessions">,
  "id" | "title" | "image_urls" | "max_participants"
>;
type OccurrenceRow = Pick<
  Tables<"session_occurrences">,
  "id" | "session_id" | "starts_at" | "ends_at" | "capacity"
>;
type BookingRow = Pick<Tables<"bookings">, "occurrence_id" | "status">;

type AttendeeCountByOccurrence = Record<string, number>;
const COUNT_STATUSES: Enums<"booking_status">[] = [
  "pending",
  "confirmed",
  "completed",
];

// ---- Fix: Promise-Variante für searchParams ----
type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {}; // <- wichtig

  const supa = await supabaseServerRead();
  const { data: auth } = await supa.auth.getUser();
  const uid = auth?.user?.id ?? null;

  if (!uid) {
    return <div className="p-6 text-sm text-slate-700">Bitte einloggen.</div>;
  }

  const FROM = startOfDayLocal(new Date());
  const TO = addDays(FROM, 30);

  // 1) Alle Sessions des Experts
  const { data: mySessions, error: sErr } = await supa
    .from("sessions")
    .select("id, title, image_urls, max_participants")
    .eq("expert_user_id", uid);

  if (sErr) throw new Error(sErr.message);

  const sessionIds = (mySessions ?? []).map((s) => s.id);
  if (sessionIds.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Deine Sessions</h1>
        <div className="rounded-xl border p-4 text-sm text-slate-600">
          Noch keine Sessions. Lege gleich eine neue an.
        </div>
      </div>
    );
  }

  // 2) Occurrences für 30 Tage
  const { data: occ, error: oErr } = await supa
    .from("session_occurrences")
    .select("id, session_id, starts_at, ends_at, capacity")
    .in("session_id", sessionIds)
    .gte("starts_at", FROM.toISOString())
    .lt("starts_at", TO.toISOString())
    .order("starts_at", { ascending: true });

  if (oErr) throw new Error(oErr.message);

  const occIds = (occ ?? []).map((o) => o.id);

  // 3) Teilnehmer via bookings zählen
  let attendees: AttendeeCountByOccurrence = {};
  if (occIds.length) {
    const { data: bks, error: bErr } = await supa
      .from("bookings")
      .select("occurrence_id, status")
      .in("occurrence_id", occIds);

    if (bErr) throw new Error(bErr.message);

    attendees = (bks as BookingRow[]).reduce<AttendeeCountByOccurrence>(
      (acc, b) => {
        if (COUNT_STATUSES.includes(b.status)) {
          acc[b.occurrence_id] = (acc[b.occurrence_id] ?? 0) + 1;
        }
        return acc;
      },
      {}
    );
  }

  const sessions = (mySessions ?? []) as SessionRow[];
  const occurrences = (occ ?? []) as OccurrenceRow[];

  // Vor-Auswahl aus URL (?occ=...) oder erste kommende
  const urlOcc = typeof sp.occ === "string" ? sp.occ : undefined;
  const initialSelectedOccurrenceId =
    (urlOcc && occurrences.find((o) => o.id === urlOcc)?.id) ||
    occurrences[0]?.id ||
    null;

  return (
    <SessionsDashboardClient
      sessions={sessions}
      occurrences={occurrences}
      attendees={attendees}
      initialSelectedOccurrenceId={initialSelectedOccurrenceId}
    />
  );
}
