// src/app/(protected)/dashboard/motionexpert/occ/[id]/checkin/CheckinClient.tsx
"use client";

import * as React from "react";
import { supabase } from "@/lib/supabaseBrowser";
import { QR } from "@/components/qr/QR";

type BookingRow = {
  id: string;
  athlete_user_id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  payment: "none" | "reserved" | "paid" | "refunded";
  checked_in_at: string | null;
  profile: { name: string; avatar_url: string | null };
};

export default function CheckinClient({
  occId,
  qrUrl,
  token,
  expiresAt,
  initialBookings,
}: {
  occId: string;
  qrUrl: string;
  token: string;
  expiresAt: string;
  initialBookings: BookingRow[];
}) {
  const [now, setNow] = React.useState(() => Date.now());
  const [rows, setRows] = React.useState<BookingRow[]>(initialBookings ?? []);

  React.useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const exp = new Date(expiresAt).getTime();
  const msLeft = Math.max(0, exp - now);
  const expired = msLeft <= 0;
  const mm = String(Math.floor(msLeft / 60000)).padStart(2, "0");
  const ss = String(Math.floor((msLeft % 60000) / 1000)).padStart(2, "0");

  // Hilfsfunktionen
  const upsertWithProfile = React.useCallback(
    async (b: {
      id: string;
      athlete_user_id: string;
      status: BookingRow["status"];
      payment: BookingRow["payment"];
      checked_in_at: string | null;
    }) => {
      // Profile aus aktuellem Cache übernehmen oder einmalig nachladen
      let profile = rows.find(
        (r) => r.athlete_user_id === b.athlete_user_id
      )?.profile;
      if (!profile) {
        const { data: p } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .eq("user_id", b.athlete_user_id)
          .maybeSingle();
        profile = p
          ? { name: p.name, avatar_url: p.avatar_url }
          : { name: b.athlete_user_id, avatar_url: null };
      }
      setRows((prev) => {
        const idx = prev.findIndex((x) => x.id === b.id);
        const next = [...prev];
        const merged: BookingRow = { ...b, profile };
        if (idx === -1) next.push(merged);
        else next[idx] = { ...next[idx], ...merged };
        return next;
      });
    },
    [rows]
  );

  const removeById = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  // Realtime: gezielt auf INSERT/UPDATE/DELETE reagieren
  React.useEffect(() => {
    const ch = supabase
      .channel(`occ-${occId}-bookings`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `occurrence_id=eq.${occId}`,
        },
        (payload) => {
          const b = payload.new as any;
          void upsertWithProfile({
            id: b.id,
            athlete_user_id: b.athlete_user_id,
            status: b.status,
            payment: b.payment,
            checked_in_at: b.checked_in_at,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `occurrence_id=eq.${occId}`,
        },
        (payload) => {
          const b = payload.new as any; // z. B. beim Check-in ändert sich checked_in_at/status
          void upsertWithProfile({
            id: b.id,
            athlete_user_id: b.athlete_user_id,
            status: b.status,
            payment: b.payment,
            checked_in_at: b.checked_in_at,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookings",
          filter: `occurrence_id=eq.${occId}`,
        },
        (payload) => removeById((payload.old as any).id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [occId, upsertWithProfile]);

  // Abgeleitete Listen
  const checkedIn = React.useMemo(
    () =>
      rows
        .filter(
          (r) =>
            !!r.checked_in_at &&
            (r.status === "confirmed" || r.status === "completed")
        )
        .sort((a, b) =>
          (a.checked_in_at || "").localeCompare(b.checked_in_at || "")
        ),
    [rows]
  );

  const expected = React.useMemo(
    () => rows.filter((r) => !r.checked_in_at && r.status !== "cancelled"),
    [rows]
  );

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Check-in QR</h1>
        <p className="text-sm text-slate-600">
          Gültig bis {new Date(expiresAt).toLocaleTimeString()}{" "}
          {!expired && (
            <span>
              ({mm}:{ss})
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border bg-white p-6">
        <QR value={qrUrl} size={280} />
        <div className="text-center">
          <p className="text-xs text-slate-500">Fallback-Code</p>
          <p className="text-2xl font-mono tracking-widest">{token}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={qrUrl}
            target="_blank"
            className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
          >
            Test-Check-in öffnen
          </a>
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={() => navigator.clipboard.writeText(token)}
          >
            Code kopieren
          </button>
          <a
            href="?refresh=1"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Code neu erzeugen
          </a>
        </div>
        {expired && (
          <div className="w-full rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
            Der Code ist abgelaufen.{" "}
            <a href="?refresh=1" className="underline">
              Jetzt neuen Code erzeugen
            </a>
          </div>
        )}
      </div>

      {/* Teilnehmerstatus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-3">
            Eingecheckt ({checkedIn.length})
          </h2>
          <ul className="space-y-2">
            {checkedIn.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={r.profile?.avatar_url || "/avatar.png"}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="text-sm">
                    <div className="font-medium">
                      {r.profile?.name ?? r.athlete_user_id}
                    </div>
                    <div className="text-xs text-slate-500">
                      {r.checked_in_at
                        ? new Date(r.checked_in_at).toLocaleTimeString()
                        : ""}
                    </div>
                  </div>
                </div>
                <span
                  className={
                    "text-xs rounded-full px-2 py-0.5 ring-1 " +
                    (r.payment === "paid"
                      ? "bg-green-50 text-green-700 ring-green-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200")
                  }
                >
                  {r.payment === "paid" ? "Bezahlt" : "Offen"}
                </span>
              </li>
            ))}
            {checkedIn.length === 0 && (
              <li className="text-sm text-slate-500">
                Noch niemand eingecheckt.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-3">Erwartet ({expected.length})</h2>
          <ul className="space-y-2">
            {expected.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={r.profile?.avatar_url || "/avatar.png"}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="text-sm">
                    <div className="font-medium">
                      {r.profile?.name ?? r.athlete_user_id}
                    </div>
                    <div className="text-xs text-slate-500">
                      Status:{" "}
                      {r.status === "pending" ? "Reserviert" : "Bestätigt"}
                    </div>
                  </div>
                </div>
                <span
                  className={
                    "text-xs rounded-full px-2 py-0.5 ring-1 " +
                    (r.payment === "paid"
                      ? "bg-green-50 text-green-700 ring-green-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200")
                  }
                >
                  {r.payment === "paid" ? "Bezahlt" : "Offen"}
                </span>
              </li>
            ))}
            {expected.length === 0 && (
              <li className="text-sm text-slate-500">Niemand ausstehend 🎉</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
