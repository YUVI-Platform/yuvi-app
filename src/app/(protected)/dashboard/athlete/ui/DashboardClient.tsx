"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SessionCard from "./SessionCard";

type Occ = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity?: number | null;
  sessions?: {
    id: string;
    title: string | null;
    image_urls?: string[] | null;
    session_type?: string | null;
    price_cents?: number | null;
    tags?: string[] | null;
    location_type?: string | null;
  } | null;
};

export default function DashboardClient({
  myOccurrences,
  recommended,
}: {
  myOccurrences: Occ[];
  recommended: Occ[];
}) {
  const nextUp = myOccurrences?.[0] ?? null;

  const [activeDay, setActiveDay] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const days = useMemo(() => {
    const list: string[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d.toISOString().slice(0, 10));
    }
    return list;
  }, []);

  const myByDay = useMemo(() => {
    const map = new Map<string, Occ[]>();
    for (const o of myOccurrences || []) {
      const k = o.starts_at.slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(o);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    }
    return map;
  }, [myOccurrences]);

  const todays = myByDay.get(activeDay) ?? [];

  return (
    <div className="space-y-6">
      {/* Next up */}
      <section>
        <h2 className="text-base font-semibold mb-2">Next up</h2>
        {nextUp ? (
          <motion.div
            layout
            className="overflow-hidden rounded-2xl border"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href={`/dashboard/athlete/occ/${nextUp.id}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              prefetch
            >
              <SessionCard occurrence={nextUp} highlight />
            </Link>
          </motion.div>
        ) : (
          <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
            Du hast noch keine Buchungen – entdecke neue Sessions unten.
          </div>
        )}
      </section>

      {/* Day Strip */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Deine nächsten 14 Tage</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const date = new Date(d + "T00:00:00");
            const label = date.toLocaleDateString(undefined, {
              weekday: "short",
              day: "2-digit",
              month: "short",
            });
            const has = (myByDay.get(d)?.length ?? 0) > 0;
            const active = activeDay === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDay(d)}
                className={
                  "min-w-[84px] rounded-lg border px-3 py-2 text-xs " +
                  (active
                    ? "bg-black text-white border-black"
                    : "bg-white text-slate-800 hover:bg-slate-50")
                }
                aria-pressed={active}
              >
                <div className="font-medium">{label}</div>
                <div className="opacity-70">
                  {has ? `${myByDay.get(d)!.length}x` : "—"}
                </div>
              </button>
            );
          })}
        </div>

        {/* List for active day */}
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3"
          >
            {todays.length ? (
              todays.map((o) => (
                <Link
                  key={o.id}
                  href={`/dashboard/athlete/occ/${o.id}`}
                  className="block rounded-xl border hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                  prefetch
                >
                  <SessionCard occurrence={o} />
                </Link>
              ))
            ) : (
              <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
                Keine Buchungen an diesem Tag.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Empfehlungen */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold">Empfohlen für dich</h2>
        <div className="grid grid-cols-1 gap-3">
          {(recommended ?? []).slice(0, 6).map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/athlete/occ/${o.id}`}
              className="block rounded-xl border hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
              prefetch
            >
              <SessionCard occurrence={o} cta="Buchen" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
