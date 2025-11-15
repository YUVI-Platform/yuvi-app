// src/app/(protected)/dashboard/motionexpert/bookings/OccurrencePanel.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import { supabase } from "@/lib/supabaseBrowser";
import { useBookingsRealtime } from "@/lib/realtime/useBookingsRealtime";
import BookingRow from "./BookingRow";
import { Button } from "@/components/ui/button";

type Booking = {
  id: string;
  athlete_user_id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  payment: "none" | "reserved" | "paid" | "refunded";
  checked_in_at: string | null;
  name?: string;
  avatar_url?: string | null;
};

export default function OccurrencePanel({
  occurrence,
  sessionTitle,
  sessionPriceCents,
}: {
  occurrence: {
    id: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
  };
  sessionTitle: string;
  sessionPriceCents: number;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [filter, setFilter] = React.useState<"all" | "expected" | "checkedin">(
    "all"
  );

  const occId = occurrence.id;

  // lazy load when open
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!open || bookings.length) return;
      setLoading(true);
      try {
        const { data: bs, error: e1 } = await supabase
          .from("bookings")
          .select("id, athlete_user_id, status, payment, checked_in_at")
          .eq("occurrence_id", occId)
          .order("created_at", { ascending: true });

        const rows = bs ?? [];
        const uids = Array.from(new Set(rows.map((b) => b.athlete_user_id)));
        const profileMap = new Map<
          string,
          { name?: string; avatar_url?: string | null }
        >();
        if (uids.length) {
          const { data: ps } = await supabase
            .from("profiles")
            .select("user_id, name, alias, avatar_url")
            .in("user_id", uids);
          (ps ?? []).forEach((p) =>
            profileMap.set(p.user_id, {
              name: p.alias ?? p.name ?? p.user_id,
              avatar_url: p.avatar_url ?? null,
            })
          );
        }

        if (!alive) return;
        setBookings(
          rows.map((b) => ({
            ...b,
            name: profileMap.get(b.athlete_user_id)?.name ?? b.athlete_user_id,
            avatar_url: profileMap.get(b.athlete_user_id)?.avatar_url ?? null,
          }))
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, occId]);

  // realtime subscription (only when panel is open to save sockets)
  useBookingsRealtime(open ? occId : "", (evt, row: any) => {
    if (!row) return;
    if (evt === "DELETE") {
      setBookings((prev) => prev.filter((b) => b.id !== row.id));
      return;
    }

    // INSERT/UPDATE -> merge + ensure name/avatar exists
    setBookings((prev) => {
      const idx = prev.findIndex((x) => x.id === row.id);
      const merged: Booking = {
        id: row.id,
        athlete_user_id: row.athlete_user_id,
        status: row.status,
        payment: row.payment,
        checked_in_at: row.checked_in_at,
        name: prev[idx]?.name ?? row.athlete_user_id, // quick fallback; profile lazy-fill below
        avatar_url: prev[idx]?.avatar_url ?? null,
      };
      const next = [...prev];
      if (idx === -1) next.push(merged);
      else next[idx] = { ...next[idx], ...merged };
      return next;
    });

    // lazy profile fill for new athlete
    (async () => {
      const needsProfile = !bookings.find(
        (b) => b.athlete_user_id === row.athlete_user_id
      )?.name;
      if (!needsProfile) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("user_id, name, alias, avatar_url")
        .eq("user_id", row.athlete_user_id)
        .maybeSingle();
      if (p) {
        setBookings((prev) =>
          prev.map((b) =>
            b.athlete_user_id === row.athlete_user_id
              ? {
                  ...b,
                  name: p.alias ?? p.name ?? b.athlete_user_id,
                  avatar_url: p.avatar_url ?? b.avatar_url ?? null,
                }
              : b
          )
        );
      }
    })();
  });

  const expected = bookings.filter(
    (b) => !b.checked_in_at && b.status !== "cancelled"
  );
  const checkedIn = bookings
    .filter(
      (b) =>
        !!b.checked_in_at &&
        (b.status === "confirmed" || b.status === "completed")
    )
    .sort((a, b) =>
      (a.checked_in_at || "").localeCompare(b.checked_in_at || "")
    );

  const visible =
    filter === "all" ? bookings : filter === "expected" ? expected : checkedIn;

  return (
    <div className="py-3">
      {/* Summary Row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left",
          open ? "bg-slate-50" : "bg-white hover:bg-slate-50"
        )}
        aria-expanded={open}
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {new Date(occurrence.starts_at).toLocaleString()} —{" "}
            {new Date(occurrence.ends_at).toLocaleTimeString()}
          </span>
          <span className="text-xs text-slate-500">
            Kapazität {occurrence.capacity} • Session: {sessionTitle} •{" "}
            {(sessionPriceCents / 100).toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })}
          </span>
        </div>
        <div className="text-xs text-slate-600">
          <span className="mr-3">Erwartet: {expected.length}</span>
          <span>Eingecheckt: {checkedIn.length}</span>
        </div>
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-2 rounded-lg border p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Filter:</span>
            <div className="flex gap-1">
              <Button
                variant={filter === "all" ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                Alle
              </Button>
              <Button
                variant={filter === "expected" ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter("expected")}
              >
                Erwartet
              </Button>
              <Button
                variant={filter === "checkedin" ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilter("checkedin")}
              >
                Eingecheckt
              </Button>
            </div>

            <div className="ml-auto text-xs text-slate-500">
              {loading ? "Lade Buchungen…" : `${bookings.length} Buchungen`}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="text-sm text-slate-500">
              Keine Buchungen für diesen Termin.
            </div>
          ) : (
            <ul className="space-y-2">
              {visible.map((b) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  onChange={(next) => {
                    setBookings((prev) =>
                      prev.map((x) => (x.id === next.id ? next : x))
                    );
                  }}
                  onRemove={(id) => {
                    setBookings((prev) => prev.filter((x) => x.id !== id));
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
