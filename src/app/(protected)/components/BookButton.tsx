// app/(protected)/components/BookButton.tsx
"use client";
import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "./SubmitButton";
import { bookOccurrenceAction } from "./bookOccurrenceAction";
import { cancelMyBookingAction } from "./cancelMyBookingAction";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type BookState =
  | { ok: true; bookingId: string }
  | { ok: false; error: string }
  | undefined;

export default function BookButton({
  occurrenceId,
  bookingId,
  path,
}: {
  occurrenceId: string;
  bookingId: string | null;
  path: string;
}) {
  const router = useRouter();

  const [bookState, bookAction, pendingBook] = useActionState<
    BookState,
    FormData
  >(bookOccurrenceAction, undefined);
  const [openSuccess, setOpenSuccess] = React.useState(false);

  // DEBUG: sieh, ob die Action jemals zurückkommt
  React.useEffect(() => {
    console.log("[BookButton] bookState:", bookState, "pending:", pendingBook);
  }, [bookState, pendingBook]);

  // React.useEffect(() => {
  //   if (bookState?.ok) {
  //     setOpenSuccess(true);
  //     const t = setTimeout(() => {
  //       router.refresh();
  //     }, 250); // etwas Puffer, damit der Dialog sichtbar bleibt
  //     return () => clearTimeout(t);
  //   }
  // }, [bookState?.ok, router]);

  React.useEffect(() => {
    if (bookState?.ok) setOpenSuccess(true);
  }, [bookState?.ok]);

  // refresh after user closes the dialog
  const handleDialogOpenChange = (open: boolean) => {
    setOpenSuccess(open);
    if (!open) router.refresh(); // now the button swaps to "Cancel" after you dismiss
  };

  const [cancelState, cancelAction, pendingCancel] = useActionState(
    cancelMyBookingAction,
    undefined
  );

  React.useEffect(() => {
    console.log(
      "[BookButton] cancelState:",
      cancelState,
      "pending:",
      pendingCancel
    );
  }, [cancelState, pendingCancel]);

  React.useEffect(() => {
    if (cancelState && "ok" in cancelState && cancelState.ok) {
      setOpenSuccess(false);
      router.refresh();
    }
  }, [cancelState, router]);

  if (bookingId) {
    return (
      <form action={cancelAction} className="inline-block">
        <input type="hidden" name="bookingId" value={bookingId} />
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

  return (
    <>
      <form action={bookAction} className="inline-block">
        <input type="hidden" name="occurrenceId" value={occurrenceId} />
        <input type="hidden" name="path" value={path} />
        <SubmitButton className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50">
          {pendingBook ? "Bitte warten…" : "Jetzt buchen"}
        </SubmitButton>

        {/* Fehler sichtbar machen */}
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
