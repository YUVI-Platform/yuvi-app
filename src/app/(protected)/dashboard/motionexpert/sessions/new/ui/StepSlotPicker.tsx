// src/app/(protected)/dashboard/motionexpert/sessions/new/ui/StepSlotPicker.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type { Enums } from "@/types/supabase";

type SlotStatus = Enums<"slot_status">; // "available" | "held" | "booked" | "blocked" | "archived"

export type StudioSlot = {
  id: string;
  starts_at: string; // ISO
  ends_at: string; // ISO
  status: SlotStatus | string;
  capacity: number | null;
  allowed_tags: string[] | null;
};

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
function ymdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function fmtDayHeader(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtTime(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function mergeById(oldArr: StudioSlot[], incoming: StudioSlot[]) {
  const map = new Map<string, StudioSlot>();
  for (const s of oldArr) map.set(s.id, s);
  for (const s of incoming) map.set(s.id, s);
  return Array.from(map.values());
}

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
  // hält immer die neueste Callback-Ref, ohne Re-Renders auszulösen
  const emitRef = useRef<typeof onChangeSelected>(undefined);
  useEffect(() => {
    emitRef.current = onChangeSelected;
  }, [onChangeSelected]);

  // stabiles 30-Tage-Fenster
  const { FROM, TO } = useMemo(() => {
    const TODAY = startOfDayLocal(new Date());
    return { FROM: TODAY, TO: addDays(TODAY, 29) };
  }, []);

  const [slots, setSlots] = useState<StudioSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Location-Wechsel: State & Auswahl resetten
  useEffect(() => {
    setSlots([]);
    setError(null);
    setLoading(false);
    emitRef.current?.([], []);
  }, [locationId]);

  // schneller Index
  const slotIndex = useMemo(() => {
    const m = new Map<string, StudioSlot>();
    for (const s of slots) m.set(s.id, s);
    return m;
  }, [slots]);

  // Slots laden
  const fetchRange = useCallback(
    async (f: Date, t: Date) => {
      if (!locationId) return;
      setError(null);
      try {
        const url = `/api/studioSlots/${encodeURIComponent(
          locationId
        )}?from=${encodeURIComponent(toISO(f))}&to=${encodeURIComponent(
          toISO(addDays(t, 1)) // inkl. letztem Tag
        )}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { slots: StudioSlot[] };
        setSlots((prev) =>
          mergeById(prev, Array.isArray(data.slots) ? data.slots : [])
        );
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Fehler beim Laden der Slots."
        );
      }
    },
    [locationId]
  );

  // initial load
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      await fetchRange(FROM, TO);
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [fetchRange, FROM, TO]);

  // Tage bauen
  const days = useMemo(() => {
    const list: Date[] = [];
    let cur = new Date(FROM);
    while (cur <= TO) {
      list.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    return list;
  }, [FROM, TO]);

  // Gruppierung pro Tag
  const byDay = useMemo(() => {
    const map = new Map<string, StudioSlot[]>();
    for (const s of slots) {
      const k = s.starts_at.slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
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

  // Auswahl
  const isSelected = useCallback(
    (id: string) => selectedSlotIds.includes(id),
    [selectedSlotIds]
  );

  const toggleSelect = useCallback(
    (id: string) => {
      const slot = slotIndex.get(id);
      if (!slot || slot.status !== "available") return; // ❗ Guard

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
        Zeitraum: {FROM.toLocaleDateString()} – {TO.toLocaleDateString()}
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
            const k = ymdLocal(d);
            const dayAll = byDay.get(k) ?? [];
            const dayAvail = dayAll.filter((s) => s.status === "available");
            const hasAny = dayAll.length > 0;

            return (
              <div
                key={k}
                className={clsx(
                  "snap-start min-w-[240px] max-w-[260px] rounded-lg ring-1 p-2",
                  hasAny
                    ? "bg-emerald-50/40 ring-emerald-200"
                    : "bg-slate-50 ring-slate-200 opacity-70"
                )}
              >
                <div
                  className={clsx(
                    "mb-2 flex items-center justify-between text-xs",
                    hasAny ? "text-emerald-900" : "text-slate-500"
                  )}
                >
                  <div className="font-medium">{fmtDayHeader(d)}</div>
                  {/* z. B. "2/4" = 2 verfügbar von 4 gesamt */}
                  <div className="opacity-70">
                    {hasAny ? `${dayAvail.length}/${dayAll.length}` : "—"}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {!hasAny ? (
                    <div className="text-xs text-slate-500">Keine Slots</div>
                  ) : (
                    dayAll.map((s) => {
                      const selected = isSelected(s.id);
                      const selectable = s.status === "available"; // nur diese darf man wählen

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSelect(s.id)}
                          disabled={!selectable} // ❗ nicht verfügbar => disabled
                          className={clsx(
                            "w-full rounded-md px-2 py-1.5 text-xs ring-1 ring-inset text-left",
                            selected
                              ? "bg-black text-white ring-black"
                              : selectable
                              ? "bg-white text-slate-800 hover:bg-slate-100 ring-slate-200"
                              : "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed" // ❗ ausgegraut
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
