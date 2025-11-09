// app/(protected)/components/BookButton.tsx
"use client";
import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "./SubmitButton";
import { bookOccurrenceAction } from "./bookOccurrenceAction";
import { cancelMyBookingAction } from "./cancelMyBookingAction";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Enums } from "@/types/supabase";

type BookState =
  | { ok: true; bookingId: string }
  | { ok: false; error: string }
  | undefined;

type BookingLite = {
  id: string;
  status: Enums<"booking_status">;
  payment: Enums<"payment_status">;
  checked_in_at: string | null;
};

export default function BookButton({
  occurrenceId,
  booking, // ← neu: steuert UI
  path,
  // optional: für alte Aufrufer kompatibel lassen
  bookingId,
}: {
  occurrenceId: string;
  booking: BookingLite | null;
  path: string;
  bookingId?: string | null;
}) {
  const router = useRouter();

  const [bookState, bookAction, pendingBook] = useActionState<
    BookState,
    FormData
  >(bookOccurrenceAction, undefined);
  const [openSuccess, setOpenSuccess] = React.useState(false);

  React.useEffect(() => {
    if (bookState?.ok) setOpenSuccess(true);
  }, [bookState?.ok]);

  const handleDialogOpenChange = (open: boolean) => {
    setOpenSuccess(open);
    if (!open) router.refresh();
  };

  const [cancelState, cancelAction, pendingCancel] = useActionState(
    cancelMyBookingAction,
    undefined
  );

  React.useEffect(() => {
    if (cancelState && "ok" in cancelState && cancelState.ok) {
      setOpenSuccess(false);
      router.refresh();
    }
  }, [cancelState, router]);

  // Helper: Payment-Call (Link). Passe die Route an deine App an.
  const paymentHref = booking
    ? `/dashboard/athlete/checkout?bookingId=${booking.id}`
    : "#";

  // -------------- Rendering --------------
  // Kein Booking → Buchungs-Form
  if (!booking && !bookingId) {
    return (
      <>
        <form action={bookAction} className="inline-block">
          <input type="hidden" name="occurrenceId" value={occurrenceId} />
          <input type="hidden" name="path" value={path} />
          <SubmitButton className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50">
            {pendingBook ? "Bitte warten…" : "Jetzt buchen"}
          </SubmitButton>

          {bookState && "ok" in bookState && !bookState.ok && (
            <p className="mt-2 text-sm text-rose-600">{bookState.error}</p>
          )}
        </form>

        <Dialog open={openSuccess} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Buchung erfolgreich</DialogTitle>
            <div className="mt-2 text-sm text-slate-600">
              Deine Session ist gebucht. Du findest sie in deinem Dashboard.
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleDialogOpenChange(false)}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Okay
              </button>
              <a
                href="/dashboard/athlete"
                className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
              >
                Zum Dashboard
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Es gibt ein Booking → UI abhängig von Status/Check-in/Payment
  const activeBooking =
    booking ||
    (bookingId
      ? {
          id: bookingId,
          status: "pending",
          payment: "none",
          checked_in_at: null,
        }
      : null);

  // falls aus Kompatibilitätsgründen nur bookingId kam,
  // zeigen wir weiterhin den Cancel-Button (kein Check-in-Wissen)
  if (activeBooking && !booking) {
    return (
      <form action={cancelAction} className="inline-block">
        <input type="hidden" name="bookingId" value={activeBooking.id} />
        <input type="hidden" name="path" value={path} />
        <button
          type="submit"
          disabled={pendingCancel}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {pendingCancel ? "Storniere…" : "Session canceln"}
        </button>
      </form>
    );
  }

  // Ab hier: booking ist vorhanden mit allen Infos
  const isCheckedIn = !!booking?.checked_in_at;
  const isPaid = booking?.payment === "paid";
  const isPaymentReserved = booking?.payment === "reserved";

  if (isPaid) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center rounded-lg px-4 py-2 border bg-white text-emerald-700 border-emerald-600/40"
      >
        Bezahlt ✓
      </button>
    );
  }

  if (isCheckedIn) {
    return (
      <a
        href={paymentHref}
        className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-black text-white hover:opacity-90"
      >
        {isPaymentReserved ? "Zahlung fortsetzen" : "Zahlung starten"}
      </a>
    );
  }

  // Standard: gebucht, nicht eingecheckt → Cancel erlauben
  return (
    <form action={cancelAction} className="inline-block">
      <input
        type="hidden"
        name="bookingId"
        value={booking?.id ?? bookingId ?? ""}
      />
      <input type="hidden" name="path" value={path} />
      <button
        type="submit"
        disabled={pendingCancel}
        className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
      >
        {pendingCancel ? "Storniere…" : "Session canceln"}
      </button>
    </form>
  );
}
