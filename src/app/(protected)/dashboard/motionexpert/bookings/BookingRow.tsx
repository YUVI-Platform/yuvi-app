// src/app/(protected)/dashboard/motionexpert/bookings/BookingRow.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseBrowser";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

type Booking = {
  id: string;
  athlete_user_id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  payment: "none" | "reserved" | "paid" | "refunded";
  checked_in_at: string | null;
  name?: string;
  avatar_url?: string | null;
};

export default function BookingRow({
  booking,
  onChange,
  onRemove,
}: {
  booking: Booking;
  onChange: (next: Booking) => void;
  onRemove: (id: string) => void;
}) {
  const [busy, setBusy] = React.useState<string | null>(null);

  async function update(fields: Partial<Booking>) {
    setBusy("save");
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update(fields)
        .eq("id", booking.id)
        .select("id, athlete_user_id, status, payment, checked_in_at")
        .maybeSingle();
      if (!error && data) {
        onChange({ ...booking, ...data });
      }
    } finally {
      setBusy(null);
    }
  }

  async function cancelBooking() {
    setBusy("cancel");
    try {
      // bevorzugt via RPC (falls Policy vorhanden); sonst Fallback-Update
      const { error } = await supabase.rpc("cancel_booking", {
        p_booking: booking.id,
      });
      if (!error) {
        onChange({ ...booking, status: "cancelled" });
        return;
      }
      // Fallback:
      await update({ status: "cancelled" });
    } finally {
      setBusy(null);
    }
  }

  async function confirmBooking() {
    await update({ status: "confirmed" });
  }

  async function togglePaid() {
    await update({ payment: booking.payment === "paid" ? "none" : "paid" });
  }

  async function manualCheckin() {
    setBusy("checkin");
    try {
      const now = new Date().toISOString();
      await update({
        checked_in_at: now,
        status: booking.status === "pending" ? "confirmed" : booking.status,
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="flex items-center justify-between rounded-lg border px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-100">
          <Image
            src={booking.avatar_url ?? "/avatar.png"}
            alt={booking.name ?? booking.athlete_user_id}
            fill
            className="object-cover"
          />
        </div>
        <div className="text-sm">
          <div className="font-medium">
            {booking.name ?? booking.athlete_user_id}
          </div>
          <div className="text-xs text-slate-500">
            {booking.checked_in_at
              ? `Check-in: ${new Date(
                  booking.checked_in_at
                ).toLocaleTimeString()}`
              : booking.status === "pending"
              ? "Reserviert"
              : booking.status === "cancelled"
              ? "Storniert"
              : "Bestätigt"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "text-xs rounded-full px-2 py-0.5 ring-1",
            booking.payment === "paid"
              ? "bg-green-50 text-green-700 ring-green-200"
              : "bg-amber-50 text-amber-700 ring-amber-200"
          )}
        >
          {booking.payment === "paid" ? "Bezahlt" : "Offen"}
        </span>

        {/* Actions */}
        <div className="flex gap-1">
          {booking.status !== "cancelled" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy !== null}
              onClick={confirmBooking}
            >
              Bestätigen
            </Button>
          )}
          {booking.status !== "cancelled" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy !== null}
              onClick={manualCheckin}
            >
              Check-in
            </Button>
          )}
          <Button
            size="sm"
            variant={booking.payment === "paid" ? "destructive" : "default"}
            disabled={busy !== null}
            onClick={togglePaid}
          >
            {booking.payment === "paid" ? "Unbezahlt" : "Als bezahlt"}
          </Button>
          {booking.status !== "cancelled" ? (
            <Button
              size="sm"
              variant="destructive"
              disabled={busy !== null}
              onClick={cancelBooking}
            >
              Stornieren
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy !== null}
              onClick={() => onRemove(booking.id)}
              title="Aus Liste entfernen"
            >
              Entfernen
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
