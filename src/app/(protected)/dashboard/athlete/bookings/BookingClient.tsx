// app/(protected)/dashboard/athlete/bookings/BookingsClient.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, TrashIcon } from "lucide-react";
import QRScannerOverlay from "@/components/qr/QRScannerOverlay";

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
  cancelAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();

  // Scanner State
  const [scanOpen, setScanOpen] = React.useState(false);
  const [activeOcc, setActiveOcc] = React.useState<string | null>(null);
  const [scanErr, setScanErr] = React.useState<string>("");

  function openScanner(occurrenceId?: string | null) {
    if (!occurrenceId) {
      setScanErr("Diese Buchung hat keine Occurrence-ID.");
      setTimeout(() => setScanErr(""), 2500);
      return;
    }
    setActiveOcc(occurrenceId);
    setScanOpen(true);
  }

  function handleDetected(text: string) {
    try {
      let code = "";
      let occFromQr: string | null = null;

      // 1) Versuche, den QR-Inhalt als URL zu interpretieren
      try {
        const u = new URL(text, window.location.origin);
        code = u.searchParams.get("code") ?? "";
        const parts = u.pathname.split("/");
        const occIdx = parts.indexOf("occ");
        if (occIdx >= 0 && parts.length > occIdx + 1) {
          occFromQr = parts[occIdx + 1];
        }
      } catch {
        // 2) Fallback: QR war nur der Code selbst
        code = text.trim();
      }

      if (!code) {
        setScanErr("Im QR wurde kein Code gefunden.");
        setTimeout(() => setScanErr(""), 2500);
        return;
      }

      if (!activeOcc) {
        setScanErr("Interner Fehler: keine aktive Occurrence.");
        setTimeout(() => setScanErr(""), 2500);
        return;
      }

      // Wenn der QR eine andere Occurrence enthält, blocken wir
      if (occFromQr && occFromQr !== activeOcc) {
        setScanErr("Dieser QR gehört zu einer anderen Session.");
        setTimeout(() => setScanErr(""), 2500);
        return;
      }

      setScanOpen(false);

      // Leite auf die dedizierte Check-in-Seite um (die triggert den Server-Check)
      router.push(
        `/dashboard/athlete/occ/${activeOcc}/checkin?code=${encodeURIComponent(
          code
        )}`
      );
    } catch {
      setScanErr("Ungültiger QR-Inhalt.");
      setTimeout(() => setScanErr(""), 2500);
    }
  }

  if (!bookings?.length) {
    return (
      <div className="text-sm text-slate-600">
        Du hast noch keine Buchungen.
      </div>
    );
  }

  return (
    <>
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

          const canScan =
            (b.status === "pending" || b.status === "confirmed") &&
            !!b.occurrence?.id;

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
                    {/* Scan-Button nur, wenn Check-in sinnvoll ist */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openScanner(b.occurrence?.id)}
                      disabled={!canScan}
                    >
                      QR scannen
                    </Button>

                    {/* Stornieren, wenn nicht abgeschlossen/storniert */}
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
                        {b.status === "completed"
                          ? "Abgeschlossen"
                          : "Storniert"}
                      </span>
                    )}
                  </div>
                </div>

                {scanErr && (
                  <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {scanErr}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ein zentrales Overlay – wir merken uns die aktive Occurrence */}
      <QRScannerOverlay
        open={scanOpen}
        onOpenChange={setScanOpen}
        onDetected={handleDetected}
      />
    </>
  );
}
