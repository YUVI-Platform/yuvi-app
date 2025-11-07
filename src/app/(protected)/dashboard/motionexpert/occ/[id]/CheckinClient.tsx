"use client";

import { useState, useTransition } from "react";
import QRScannerOverlay from "@/components/qr/QRScannerOverlay";
import { checkinBookingAction } from "./actions";

export default function CheckinClient({
  occurrenceId,
}: {
  occurrenceId: string;
}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDetected(text: string) {
    try {
      // Wir encodieren: { b: bookingId, c: checkin_code }
      const { b, c } = JSON.parse(text) as { b?: string; c?: string };
      if (!b || !c) throw new Error();
      const fd = new FormData();
      fd.set("occurrenceId", occurrenceId);
      fd.set("bookingId", b);
      fd.set("code", c);

      startTransition(async () => {
        try {
          await checkinBookingAction(fd);
          setMsg("Check-in erfolgreich ✅");
        } catch (e: unknown) {
          if (e instanceof Error) {
            setMsg(e.message);
          } else if (typeof e === "string") {
            setMsg(e);
          } else {
            setMsg("Check-in fehlgeschlagen.");
          }
        }
      });
    } catch {
      setMsg("Ungültiger QR-Inhalt.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-black text-white px-4 py-2"
        disabled={pending}
      >
        QR-Scanner öffnen
      </button>
      {msg && <span className="text-sm text-slate-600">{msg}</span>}

      <QRScannerOverlay
        open={open}
        onOpenChange={setOpen}
        onDetected={handleDetected}
      />
    </div>
  );
}
