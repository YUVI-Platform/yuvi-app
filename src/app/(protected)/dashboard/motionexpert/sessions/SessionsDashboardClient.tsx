"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";

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

/* ---- Format helpers (lokale Zeit) ---- */
function fmtTime(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtDayHeader(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtDay(iso: string) {
  const dt = new Date(iso);
  return fmtDayHeader(dt);
}
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
function ymdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function SessionsDashboardClient({
  sessions,
  occurrences,
  attendees,
  initialSelectedOccurrenceId,
}: {
  sessions: SessionRow[];
  occurrences: OccurrenceRow[];
  attendees: AttendeeCountByOccurrence;
  initialSelectedOccurrenceId: string | null;
}) {
  const [selectedOccId, setSelectedOccId] = useState<string | null>(
    initialSelectedOccurrenceId
  );

  const sessionById = useMemo(() => {
    const m = new Map<string, SessionRow>();
    for (const s of sessions) m.set(s.id, s);
    return m;
  }, [sessions]);

  const occurrenceById = useMemo(() => {
    const m = new Map<string, OccurrenceRow>();
    for (const o of occurrences) m.set(o.id, o);
    return m;
  }, [occurrences]);

  const selectedOcc = selectedOccId
    ? occurrenceById.get(selectedOccId) ?? null
    : null;
  const selectedSession = selectedOcc
    ? sessionById.get(selectedOcc.session_id) ?? null
    : null;

  // Kalender vorbereiten
  const now = new Date();
  const start = startOfDayLocal(now);
  const days = useMemo(() => {
    // gruppieren nach YYYY-MM-DD
    const byDay = new Map<string, OccurrenceRow[]>();
    for (const o of occurrences) {
      const k = o.starts_at.slice(0, 10);
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k)!.push(o);
    }
    // 30-Tage-Array
    const list: { key: string; date: Date; occs: OccurrenceRow[] }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = addDays(start, i);
      const k = ymdLocal(d);
      list.push({ key: k, date: d, occs: byDay.get(k) ?? [] });
    }
    // sortiere Occs pro Tag
    for (const day of list) {
      day.occs.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }
    return list;
  }, [occurrences, start]);

  const handlePickOccurrence = useCallback((id: string) => {
    setSelectedOccId(id);
    // Optional: URL-Query (?occ=...) aktualisieren (ohne Reload)
    const url = new URL(window.location.href);
    url.searchParams.set("occ", id);
    window.history.replaceState({}, "", url.toString());
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Deine Sessions</h1>
        <Link
          href="/dashboard/motionexpert/sessions/new"
          className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-black/90"
        >
          Neue Session
        </Link>
      </div>

      {/* HERO (zeigt aktuell gewählte oder nächste) */}
      <section className="rounded-2xl border">
        <div className="p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-700">
            {selectedOcc ? "Ausgewählter Termin" : "Als nächstes"}
          </h2>

          {occurrences.length === 0 ? (
            <div className="mt-2 text-sm text-slate-600">
              In den nächsten 30 Tagen sind keine Termine geplant.
            </div>
          ) : (
            <HeroOccurrenceCard
              occurrence={selectedOcc ?? occurrences[0]}
              session={
                selectedOcc
                  ? selectedSession
                  : sessionById.get(occurrences[0].session_id) ?? null
              }
              attendeeCount={
                selectedOcc
                  ? attendees[selectedOcc.id] ?? null
                  : attendees[occurrences[0].id] ?? null
              }
            />
          )}
        </div>
      </section>

      {/* KALENDER 30 Tage (klick aktualisiert Hero) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">
          Nächste 30 Tage
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {days.map(({ key, date, occs }) => (
            <div
              key={key}
              className="rounded-xl border bg-white p-3 ring-1 ring-inset ring-slate-100"
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <div className="font-medium text-slate-800">
                  {fmtDayHeader(date)}
                </div>
                <div className="text-slate-500">
                  {occs.length ? `${occs.length}×` : "—"}
                </div>
              </div>

              {occs.length === 0 ? (
                <div className="text-xs text-slate-500">Keine Sessions</div>
              ) : (
                <ul className="space-y-1.5">
                  {occs.map((o) => {
                    const s = sessionById.get(o.session_id) ?? null;
                    const booked = attendees[o.id] ?? null;
                    const cap = o.capacity ?? s?.max_participants ?? null;
                    const isActive = selectedOccId === o.id;

                    return (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={() => handlePickOccurrence(o.id)}
                          className={
                            "flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-xs transition " +
                            (isActive
                              ? "border-black bg-black text-white"
                              : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
                          }
                          title={`${fmtTime(o.starts_at)}–${fmtTime(
                            o.ends_at
                          )}`}
                        >
                          <div className="min-w-0 flex items-center gap-2">
                            <span
                              className={
                                "inline-block h-2.5 w-2.5 shrink-0 rounded-full " +
                                (isActive ? "bg-white" : "bg-emerald-500")
                              }
                            />
                            <div className="truncate">
                              <span
                                className={
                                  "mr-1 font-medium " +
                                  (isActive ? "text-white" : "text-slate-800")
                                }
                              >
                                {fmtTime(o.starts_at)}
                              </span>
                              <span
                                className={
                                  isActive ? "text-white/90" : "text-slate-700"
                                }
                              >
                                {s?.title ?? "Ohne Titel"}
                              </span>
                            </div>
                          </div>
                          <div
                            className={
                              "ml-3 shrink-0 tabular-nums " +
                              (isActive ? "text-white/90" : "text-slate-600")
                            }
                          >
                            {booked != null && cap != null ? (
                              <span>
                                {booked}/{cap}
                              </span>
                            ) : cap != null ? (
                              <span>max. {cap}</span>
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroOccurrenceCard({
  occurrence,
  session,
  attendeeCount,
}: {
  occurrence: OccurrenceRow;
  session: SessionRow | null;
  attendeeCount: number | null;
}) {
  const cover =
    (session?.image_urls && session.image_urls[0]) || "/placeholder.jpg";

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="aspect-[16/6] w-full bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="space-y-3 p-4">
        <div className="text-xs text-slate-600">
          {fmtDay(occurrence.starts_at)}
        </div>
        <h3 className="text-lg font-semibold">
          {session?.title ?? "Session ohne Titel"}
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <InfoTile label="Start" value={fmtTime(occurrence.starts_at)} />
          <InfoTile label="Ende" value={fmtTime(occurrence.ends_at)} />
          <InfoTile
            label="Kapazität"
            value={
              occurrence.capacity != null
                ? String(occurrence.capacity)
                : session?.max_participants != null
                ? String(session.max_participants)
                : "—"
            }
          />
          <InfoTile
            label="Teilnehmer"
            value={attendeeCount != null ? String(attendeeCount) : "—"}
          />
        </div>

        <div className="pt-1">
          <div className="pt-1 flex gap-2">
            <Link
              href={`/dashboard/motionexpert/occ/${occurrence.id}`}
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-yuvi-skyblue hover:text-white"
            >
              Verwalten
            </Link>

            {/* ⬇️ Neuer Button: Check-in starten */}
            <Link
              href={`/dashboard/motionexpert/occ/${occurrence.id}/checkin`}
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
            >
              Check-in starten
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

//TODO: Buttons alle einheitlich gestalten mit hoverstates und Animationen.
