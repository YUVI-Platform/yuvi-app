// app/(protected)/dashboard/motionexpert/sessions/page.tsx
import { supabaseServerRead } from "@/lib/supabaseServer";
import SessionsDashboardClient from "./SessionsDashboardClient";

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

type SessionRow = {
  id: string;
  title: string | null;
  image_urls: string[] | null;
  max_participants: number | null;
};
type OccurrenceRow = {
  id: string;
  session_id: string;
  starts_at: string; // ISO
  ends_at: string; // ISO
  capacity: number | null;
};
type AttendeeCountByOccurrence = Record<string, number>;

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supa = await supabaseServerRead();

  const { data: auth } = await supa.auth.getUser();
  const uid = auth?.user?.id ?? null;

  if (!uid) {
    // In deiner App likely via middleware geschützt – hier einfacher Fallback:
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

  // 3) Optional: Teilnehmer zählen (falls Tabelle existiert)
  let attendees: AttendeeCountByOccurrence = {};
  try {
    const occIds = (occ ?? []).map((o) => o.id);
    if (occIds.length) {
      const { data: regs } = await supa
        .from("session_registrations")
        .select("session_occurrence_id")
        .in("session_occurrence_id", occIds);

      if (regs) {
        attendees = regs.reduce<AttendeeCountByOccurrence>((acc, r) => {
          const id = (r as any).session_occurrence_id as string;
          acc[id] = (acc[id] ?? 0) + 1;
          return acc;
        }, {});
      }
    }
  } catch {
    // ignore if not present
  }

  const sessions = (mySessions ?? []) as SessionRow[];
  const occurrences = (occ ?? []) as OccurrenceRow[];

  // Vor-Auswahl aus URL (?occ=...) oder erste kommende
  const urlOcc =
    typeof searchParams?.occ === "string" ? searchParams!.occ : undefined;
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
