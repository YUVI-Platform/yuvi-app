"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

export type SlotRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity: number | null;
  status: string;
  allowed_tags: string[] | null;
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SlotPicker({
  locationId,
  initialDays = 14,
  selected,
  onChange,
}: {
  locationId: string;
  initialDays?: number;
  selected: string[]; // selected slot ids
  onChange: (ids: string[]) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [daysSpan, setDaysSpan] = useState(initialDays);
  const [slots, setSlots] = useState<SlotRow[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const from = new Date().toISOString();
        const to = new Date(
          Date.now() + daysSpan * 24 * 3600 * 1000
        ).toISOString();
        const res = await fetch(
          `/api/studioSlots/${locationId}?from=${encodeURIComponent(
            from
          )}&to=${encodeURIComponent(to)}&onlyFree=1`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Fetch error");
        if (alive) setSlots(json.slots ?? []);
      } catch (e: any) {
        if (alive) setErr(e.message || "Unbekannter Fehler");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [locationId, daysSpan]);

  const grouped = useMemo(() => {
    // 👉 nur freie Slots
    const visible = slots.filter((s) => s.status === "available");

    const map = new Map<string, SlotRow[]>();
    for (const s of visible) {
      const key = new Date(s.starts_at).toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    }
    // sort by day asc
    return Array.from(map.entries()).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0
    );
  }, [slots]);

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          3) Verfügbare Slots wählen
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">Zeitraum:</span>
          <button
            type="button"
            onClick={() => setDaysSpan(7)}
            className={btn(daysSpan === 7)}
          >
            7 Tage
          </button>
          <button
            type="button"
            onClick={() => setDaysSpan(14)}
            className={btn(daysSpan === 14)}
          >
            14 Tage
          </button>
          <button
            type="button"
            onClick={() => setDaysSpan(30)}
            className={btn(daysSpan === 30)}
          >
            30 Tage
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-slate-500">Lade Slots…</div>}
      {err && (
        <div className="text-sm text-rose-600">
          Konnte Slots nicht laden: {err}
        </div>
      )}

      {!loading && !err && !grouped.length && (
        <div className="rounded-md border p-3 text-sm text-slate-500">
          In diesem Zeitraum sind keine Slots vorhanden.
        </div>
      )}

      <div className="space-y-4">
        {grouped.map(([day, list]) => (
          <div key={day} className="rounded-xl border bg-white">
            <div className="border-b px-4 py-2 text-sm font-medium">
              {fmtDate(list[0].starts_at)}
            </div>
            <div className="flex flex-wrap gap-2 p-3">
              {list.map((s) => {
                const isPicked = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggle(s.id)}
                    className={clsx(
                      "rounded-full px-3 py-1.5 text-sm ring-1 ring-inset",
                      isPicked
                        ? "bg-black text-white ring-black"
                        : "bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100"
                    )}
                    title={
                      s.capacity != null
                        ? `Kapazität: ${s.capacity}`
                        : undefined
                    }
                  >
                    {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!!selected.length && (
        <div className="text-xs text-slate-600">
          Ausgewählt: <b>{selected.length}</b> Slot
          {selected.length === 1 ? "" : "s"}
        </div>
      )}
    </section>
  );
}

function btn(active: boolean) {
  return clsx(
    "rounded-md border px-2 py-1",
    active ? "bg-black text-white border-black" : "hover:bg-slate-50"
  );
}
