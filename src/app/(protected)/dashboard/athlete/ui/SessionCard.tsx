// app/(protected)/components/SessionCard.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { bookOccurrenceAction } from "@/app/(protected)/components/bookOccurrenceAction";
import { cancelMyBookingAction } from "@/app/(protected)/components/cancelMyBookingAction";

function fmtTime(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtDay(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

type BookState =
  | { ok: true; bookingId: string }
  | { ok: false; error: string }
  | undefined;
type CancelState = { ok: true } | { ok: false; error: string } | undefined;

export default function SessionCard({
  occurrence,
  highlight,
  // Neues Prop: anfänglicher Buchungszustand für diesen User/Occurrence
  initialBookingId,
  // Seite/Route, die nach Server-Action revalidiert werden soll
  path,
  // Optional: Link auf Detailseite, falls du zusätzlich einen "Details"-Button zeigen willst
  detailsHref,
}: {
  occurrence: {
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
    studio_slots?: {
      studio_locations?: {
        title?: string | null;
        address?: unknown;
        image_urls?: string[] | null;
      } | null;
    } | null;
  };
  highlight?: boolean;
  initialBookingId: string | null; // ← wichtig
  path: string; // ← wichtig
  detailsHref?: string;
}) {
  const router = useRouter();

  // Lokaler UI-Status: spiegelt sofort "gebucht/abgemeldet" wider
  const [localBookingId, setLocalBookingId] = React.useState<string | null>(
    initialBookingId
  );

  // --- BOOK ---
  const [bookState, bookAction, pendingBook] = useActionState<
    BookState,
    FormData
  >(bookOccurrenceAction, undefined);
  const [openSuccess, setOpenSuccess] = React.useState(false);

  React.useEffect(() => {
    if (bookState?.ok) {
      setLocalBookingId(bookState.bookingId); // direkt UI umschalten
      setOpenSuccess(true); // Dialog bleibt offen bis Klick
      router.refresh(); // Seats/Badges usw. aktualisieren
    }
  }, [bookState?.ok, bookState, router]);

  // --- CANCEL ---
  const [cancelState, cancelAction, pendingCancel] = useActionState<
    CancelState,
    FormData
  >(cancelMyBookingAction, undefined);

  React.useEffect(() => {
    if (cancelState?.ok) {
      setLocalBookingId(null); // UI zurück auf "Buchen"
      router.refresh();
    }
  }, [cancelState?.ok, router]);

  const s = occurrence.sessions;
  const img =
    s?.image_urls?.[0] ||
    occurrence.studio_slots?.studio_locations?.image_urls?.[0] ||
    "/placeholder.jpg";

  const price =
    typeof s?.price_cents === "number"
      ? `${(s!.price_cents / 100).toFixed(2)} €`
      : "—";

  const isBooked = !!localBookingId;

  return (
    <div
      className={clsx(
        "overflow-hidden",
        highlight ? "rounded-2xl" : "rounded-xl"
      )}
    >
      <div
        className={clsx(
          "w-full",
          highlight ? "aspect-[16/7]" : "aspect-[16/9] bg-slate-100"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="p-4 space-y-2">
        <div className="text-xs text-slate-600">
          {fmtDay(occurrence.starts_at)} · {fmtTime(occurrence.starts_at)}–
          {fmtTime(occurrence.ends_at)}
        </div>
        <h3 className="text-sm font-semibold">{s?.title || "Ohne Titel"}</h3>
        <div className="text-xs text-slate-600">
          {s?.session_type ?? "Session"} · {price}
        </div>

        {!!s?.tags?.length && (
          <div className="mt-1 flex flex-wrap gap-1">
            {(s.tags ?? []).slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 ring-1 ring-slate-200"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="pt-2 grid grid-cols-2 gap-2">
          {/* Primary: Buchen/Cancel */}
          {isBooked ? (
            <form action={cancelAction} className="col-span-2 sm:col-span-1">
              <input
                type="hidden"
                name="bookingId"
                value={localBookingId ?? ""}
              />
              <input type="hidden" name="path" value={path} />
              <button
                type="submit"
                disabled={pendingCancel}
                className="w-full rounded-lg bg-rose-600 px-4 py-2 text-white text-sm hover:bg-rose-700 disabled:opacity-50"
              >
                {pendingCancel ? "Storniere…" : "Session canceln"}
              </button>
            </form>
          ) : (
            <form action={bookAction} className="col-span-2 sm:col-span-1">
              <input type="hidden" name="occurrenceId" value={occurrence.id} />
              <input type="hidden" name="path" value={path} />
              <button
                type="submit"
                disabled={pendingBook}
                className="w-full rounded-lg bg-black px-4 py-2 text-white text-sm hover:bg-black/90 disabled:opacity-50"
              >
                {pendingBook ? "Bitte warten…" : "Jetzt buchen"}
              </button>

              {/* Fehler direkt unter dem Button */}
              {bookState && "ok" in bookState && !bookState.ok && (
                <p className="mt-2 text-xs text-rose-600">{bookState.error}</p>
              )}
            </form>
          )}

          {/* Secondary: Details-Link (optional) */}
          {detailsHref && (
            <a
              href={detailsHref}
              className="col-span-2 sm:col-span-1 inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
            >
              Details
            </a>
          )}
        </div>
      </div>

      {/* Erfolg-Dialog bleibt offen bis Nutzer klickt */}
      <Dialog open={openSuccess} onOpenChange={setOpenSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Buchung erfolgreich</DialogTitle>
          <div className="mt-2 text-sm text-slate-600">
            Deine Session ist gebucht. Du findest sie in deinem Dashboard.
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setOpenSuccess(false)}
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
    </div>
  );
}
