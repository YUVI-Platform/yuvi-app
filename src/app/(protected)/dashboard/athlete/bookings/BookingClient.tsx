// app/(protected)/dashboard/athlete/bookings/BookingsClient.tsx
"use client";

import * as React from "react";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, TrashIcon } from "lucide-react";

type Session = {
  id: string;
  title: string;
  image_urls: string[] | null;
  price_cents: number;
};

type Occurrence = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  session: Session | null;
};

type Booking = {
  id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  payment: "none" | "reserved" | "paid" | "refunded";
  checkin_code: string | null;
  created_at: string | null;
  occurrence: Occurrence | null;
};

export default function BookingsClient({
  bookings,
  cancelAction,
}: {
  bookings: Booking[];
  // Server Action wird als Form-Action genutzt (ist erlaubt)
  cancelAction: (formData: FormData) => Promise<void>;
}) {
  if (!bookings?.length) {
    return (
      <div className="text-sm text-slate-600">
        Du hast noch keine Buchungen.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((b) => {
        const s = b.occurrence?.session;
        const starts = b.occurrence?.starts_at
          ? new Date(b.occurrence.starts_at).toLocaleString()
          : "—";
        const ends = b.occurrence?.ends_at
          ? new Date(b.occurrence.ends_at).toLocaleString()
          : "—";
        const price = s?.price_cents
          ? (s.price_cents / 100).toFixed(2) + " €"
          : "—";

        return (
          <Card key={b.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {s?.image_urls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={s.title}
                    src={s.image_urls[0]}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-slate-100" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{s?.title ?? "Session"}</div>
                  <div className="text-xs text-slate-500">
                    {starts} – {ends}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{price}</div>
                  <div className="text-xs text-slate-500">
                    Status: {b.status} • Payment: {b.payment}
                  </div>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-3">
                {b.checkin_code ? (
                  <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
                    <CheckIcon className="h-3.5 w-3.5" />
                    Check-in Code: <strong>{b.checkin_code}</strong>
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">
                    Kein Check-in Code
                  </span>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {/* Stornieren nur, wenn nicht schon cancelled/completed */}
                  {b.status !== "cancelled" && b.status !== "completed" ? (
                    <form action={cancelAction}>
                      <input type="hidden" name="bookingId" value={b.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Stornieren
                      </Button>
                    </form>
                  ) : (
                    <span className="text-xs text-slate-500">
                      {b.status === "completed" ? "Abgeschlossen" : "Storniert"}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
