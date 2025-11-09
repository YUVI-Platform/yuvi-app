// src/app/(protected)/dashboard/motionexpert/sessions/new/ui/StepSlotPicker.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type { Enums } from "@/types/supabase";

type SlotStatus = Enums<"slot_status">; // "available" | "held" | "booked" | "blocked" | "archived"

export type StudioSlot = {
  id: string;
  starts_at: string; // ISO string
  ends_at: string; // ISO string
  status: SlotStatus | string;
  capacity: number | null;
  allowed_tags: string[] | null;
};

/**
 * ----- Constants / i18n -----
 * We normalize all human-facing formatting to Europe/Berlin
 * so grouping and display are consistent regardless of the user's OS locale.
 */
const LOCALE = "de-DE";
const TIMEZONE = "Europe/Berlin";

/* ---------- Helpers ---------- */
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
function toISO(d: Date) {
  return d.toISOString();
}

/** YYYY-MM-DD for a Date using a specific time zone */
function ymdInTZ(date: Date) {
  // en-CA yields a stable YYYY-MM-DD format
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** YYYY-MM-DD bucket for an ISO string in Europe/Berlin */
function ymdLocalFromISO(iso: string) {
  return ymdInTZ(new Date(iso));
}

function fmtDayHeader(d: Date) {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
function fmtTime(iso: string) {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
function mergeById(oldArr: StudioSlot[], incoming: StudioSlot[]) {
  const map = new Map<string, StudioSlot>();
  for (const s of oldArr) map.set(s.id, s);
  for (const s of incoming) map.set(s.id, s);
  return Array.from(map.values());
}

/* ---------- Component ---------- */

type Props = {
  locationId: string;
  selectedSlotIds: string[];
  onChangeSelected?: (slots: StudioSlot[], ids: string[]) => void;
};

export default function StepSlotPicker({
  locationId,
  selectedSlotIds,
  onChangeSelected,
}: Props) {
  // Always keep the freshest callback without re-rendering
  const emitRef = useRef<typeof onChangeSelected>(undefined);
  useEffect(() => {
    emitRef.current = onChangeSelected;
  }, [onChangeSelected]);

  // Stable 30-day window from today
  const { FROM, TO } = useMemo(() => {
    const TODAY = startOfDayLocal(new Date());
    return { FROM: TODAY, TO: addDays(TODAY, 29) };
  }, []);

  const [slots, setSlots] = useState<StudioSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Abort ongoing fetches when location changes or unmounts
  const abortRef = useRef<AbortController | null>(null);

  // Reset on location switch
  useEffect(() => {
    abortRef.current?.abort();
    setSlots([]);
    setError(null);
    setLoading(false);
    emitRef.current?.([], []);
  }, [locationId]);

  // Fast index by id
  const slotIndex = useMemo(() => {
    const m = new Map<string, StudioSlot>();
    for (const s of slots) m.set(s.id, s);
    return m;
  }, [slots]);

  // Load slots for [from, to]
  const fetchRange = useCallback(
    async (f: Date, t: Date) => {
      if (!locationId) return;
      setError(null);
      setLoading(true);

      // cancel previous in-flight
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const url = `/api/studioSlots/${encodeURIComponent(
          locationId
        )}?from=${encodeURIComponent(toISO(f))}&to=${encodeURIComponent(
          toISO(addDays(t, 1)) // letzter Tag inkl.
        )}&onlyFree=1`;
        const res = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

        const incoming = Array.isArray(data.slots)
          ? (data.slots as StudioSlot[])
          : [];
        setSlots((prev) => mergeById(prev, incoming));
      } catch (e: unknown) {
        // ignore cancels from AbortController/fetch
        if (
          // browser DOM exception
          (typeof DOMException !== "undefined" &&
            e instanceof DOMException &&
            e.name === "AbortError") ||
          // Node/other environments
          (e instanceof Error && e.name === "AbortError")
        ) {
          return;
        }
        setError(
          e instanceof Error ? e.message : "Fehler beim Laden der Slots."
        );
      } finally {
        setLoading(false);
      }
    },
    [locationId]
  );

  // initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      await fetchRange(FROM, TO);
      if (!alive) return;
    })();
    return () => {
      alive = false;
      abortRef.current?.abort();
    };
  }, [fetchRange, FROM, TO]);

  // Day list for the scroller
  const days = useMemo(() => {
    const list: Date[] = [];
    let cur = new Date(FROM);
    while (cur <= TO) {
      list.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    return list;
  }, [FROM, TO]);

  // Group slots by local (Europe/Berlin) day of their start time
  const byDay = useMemo(() => {
    const map = new Map<string, StudioSlot[]>();
    for (const s of slots) {
      const key = ymdLocalFromISO(s.starts_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }
    return map;
  }, [slots]);

  const anyAvailable = useMemo(
    () => slots.some((s) => s.status === "available"),
    [slots]
  );

  // Selection API (controlled by parent)
  const isSelected = useCallback(
    (id: string) => selectedSlotIds.includes(id),
    [selectedSlotIds]
  );

  const toggleSelect = useCallback(
    (id: string) => {
      const slot = slotIndex.get(id);
      if (!slot || slot.status !== "available") return; // guard non-selectable

      const nextIds = selectedSlotIds?.includes(id)
        ? selectedSlotIds.filter((x) => x !== id)
        : [...(selectedSlotIds || []), id];

      const nextSlots = nextIds
        .map((x) => slotIndex.get(x))
        .filter(Boolean) as StudioSlot[];

      emitRef.current?.(nextSlots, nextIds);
    },
    [selectedSlotIds, slotIndex]
  );

  const clearSelection = useCallback(() => {
    emitRef.current?.([], []);
  }, []);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          3) Slots auswählen
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-white ring-1 ring-slate-200" />
              Verfügbar
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-black" />
              Ausgewählt
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-slate-200" />
              Belegt/Blockiert
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-emerald-400/50 ring-1 ring-emerald-300" />
              Tage mit Slots
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-slate-100 ring-1 ring-slate-200" />
              Keine Slots
            </span>
          </div>

          {!!selectedSlotIds.length && (
            <>
              <span className="font-medium">
                Ausgewählt: {selectedSlotIds.length}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded border px-2 py-1 hover:bg-slate-50"
                title="Auswahl leeren"
              >
                Leeren
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Zeitraum:{" "}
        {new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE }).format(FROM)} –{" "}
        {new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE }).format(TO)}
      </p>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Scroller mit 30 Tages-Spalten */}
      <div className="relative overflow-x-auto overflow-y-hidden rounded-xl border bg-white p-3 min-h-[300px] snap-x snap-mandatory">
        <div className="flex flex-row items-stretch gap-3">
          {days.map((d) => {
            const k = ymdInTZ(d);
            const dayAll = byDay.get(k) ?? [];
            const dayAvail = dayAll.filter((s) => s.status === "available");
            const hasAnyAvail = dayAvail.length > 0;

            return (
              <div
                key={k}
                className={clsx(
                  "snap-start min-w-[240px] max-w-[260px] rounded-lg ring-1 p-2",
                  hasAnyAvail
                    ? "bg-emerald-50/40 ring-emerald-200"
                    : "bg-slate-50 ring-slate-200 opacity-70"
                )}
              >
                <div
                  className={clsx(
                    "mb-2 flex items-center justify-between text-xs",
                    hasAnyAvail ? "text-emerald-900" : "text-slate-500"
                  )}
                >
                  <div className="font-medium">{fmtDayHeader(d)}</div>
                  {/* e.g. "2/4" = 2 available of 4 total */}
                  <div className="opacity-70">
                    {hasAnyAvail ? `${dayAvail.length}` : "—"}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {!hasAnyAvail ? (
                    <div className="text-xs text-slate-500">
                      Keine freien Slots
                    </div>
                  ) : (
                    dayAvail.map((s) => {
                      const selected = isSelected(s.id);
                      const selectable = s.status === "available"; // bleibt true hier

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSelect(s.id)}
                          disabled={false}
                          aria-pressed={selected}
                          aria-label={`${fmtTime(s.starts_at)}–${fmtTime(
                            s.ends_at
                          )} ${selectable ? "verfügbar" : String(s.status)}`}
                          className={clsx(
                            "w-full rounded-md px-2 py-1.5 text-xs ring-1 ring-inset text-left",
                            selected
                              ? "bg-black text-white ring-black"
                              : selectable
                              ? "bg-white text-slate-800 hover:bg-slate-100 ring-slate-200"
                              : "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"
                          )}
                          title={`${fmtTime(s.starts_at)}–${fmtTime(
                            s.ends_at
                          )} (${selectable ? "verfügbar" : s.status})`}
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)}
                            </span>
                            {typeof s.capacity === "number" && (
                              <span
                                className={clsx(
                                  "opacity-70",
                                  selected && "opacity-90"
                                )}
                              >
                                {s.capacity}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!loading && !anyAvailable && (
        <div className="rounded-md border bg-slate-50 p-3 text-sm text-slate-600">
          In den nächsten 30 Tagen sind keine verfügbaren Slots hinterlegt.
        </div>
      )}

      {loading && !slots.length && (
        <div className="text-sm text-slate-500">Lade Slots…</div>
      )}
    </section>
  );
}
