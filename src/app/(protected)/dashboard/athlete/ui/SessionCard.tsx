"use client";

import * as React from "react";
import Image from "next/image";
import clsx from "clsx";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { bookOccurrenceAction } from "@/app/(protected)/components/bookOccurrenceAction";
import { cancelMyBookingAction } from "@/app/(protected)/components/cancelMyBookingAction";
// ⬇️ NEU: Animationen
import { motion } from "framer-motion";

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

function StarRating({
  value = 0,
  count,
  size = 16,
}: {
  value?: number | null;
  count?: number | null;
  size?: number;
}) {
  const v = Math.max(0, Math.min(5, Number(value ?? 0)));
  const pct = (v / 5) * 100;
  const Star = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill="currentColor"
      />
    </svg>
  );
  const StarOutline = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
  return (
    <div className="flex items-center gap-1">
      <div
        className="relative inline-block"
        role="img"
        aria-label={`Bewertung ${v.toFixed(1).replace(".", ",")} von 5 Sternen`}
        style={{ width: size * 5, height: size }}
      >
        <div className="absolute inset-0 flex gap-[2px] text-yuvi-skyblue">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarOutline key={`o${i}`} />
          ))}
        </div>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          <div className="flex gap-[2px] text-yuvi-skyblue ">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={`f${i}`} />
            ))}
          </div>
        </div>
      </div>
      {typeof count === "number" && (
        <span className="text-[11px] text-slate-500">({count})</span>
      )}
    </div>
  );
}

type BookState =
  | { ok: true; bookingId: string }
  | { ok: false; error: string }
  | undefined;
type CancelState = { ok: true } | { ok: false; error: string } | undefined;

export default function SessionCard({
  occurrence,
  highlight,
  initialBookingId,
  path,
  detailsHref,
  badges,
}: {
  occurrence: {
    id: string;
    starts_at: string;
    ends_at: string;
    capacity?: number | null;
    booked_count?: number | null;
    sessions?: {
      id: string;
      title: string | null;
      image_urls?: string[] | null;
      session_type?: string | null;
      price_cents?: number | null;
      tags?: string[] | null;
      location_type?: string | null;
      expert_user_id?: string | null;
      expert?: {
        name: string | null;
        avatar_url?: string | null;
        rating_avg?: number | null;
        rating_count?: number | null;
      } | null;
      expert_profile?: {
        name: string | null;
        avatar_url?: string | null;
        rating_avg?: number | null;
        rating_count?: number | null;
      } | null;
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
  initialBookingId: string | null;
  path: string;
  detailsHref?: string;
  badges?: string[];
}) {
  const router = useRouter();
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
    // Debug hilft, ob der Server-Action-State überhaupt kommt
    // console.log("bookState changed:", bookState);
    if (bookState?.ok) {
      setLocalBookingId(bookState.bookingId);
      setOpenSuccess(true); // ✅ Dialog auf
      // kein refresh hier
    }
  }, [bookState?.ok, bookState]);

  // --- CANCEL ---
  const [cancelState, cancelAction, pendingCancel] = useActionState<
    CancelState,
    FormData
  >(cancelMyBookingAction, undefined);
  React.useEffect(() => {
    if (cancelState?.ok) {
      setLocalBookingId(null);
      router.refresh();
    }
  }, [cancelState?.ok, router]);

  const s = occurrence.sessions;
  const expertObj = s?.expert ?? s?.expert_profile ?? null;
  const expertName = expertObj?.name ?? null;
  const expertAvatar = expertObj?.avatar_url ?? null;
  const expertRatingAvg = expertObj?.rating_avg ?? null;
  const expertRatingCount = expertObj?.rating_count ?? null;

  const img =
    s?.image_urls?.[0] ||
    occurrence.studio_slots?.studio_locations?.image_urls?.[0] ||
    "/placeholder.jpg";

  const price =
    typeof s?.price_cents === "number"
      ? `${(s!.price_cents / 100).toFixed(2)} €`
      : "—";
  const isBooked = !!localBookingId;

  const bookedCount = occurrence.booked_count ?? 0;
  const capacity = occurrence.capacity ?? null;

  return (
    <>
      <div className={clsx("overflow-hidden rounded-xl border bg-white")}>
        {/* Bild */}
        <div
          className={clsx(
            "relative w-full",
            highlight ? "aspect-[16/7]" : "aspect-[16/9] bg-slate-100"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-full w-full object-cover" />
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/10 backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-yuvi-rose/90 shadow-[0_0_0_3px_rgba(255,187,226,0.25)]" />
            {fmtDay(occurrence.starts_at)} · {fmtTime(occurrence.starts_at)}–
            {fmtTime(occurrence.ends_at)}
          </div>
          {!!badges?.length && (
            <div className="absolute right-3 top-3 flex flex-wrap gap-1">
              {badges.slice(0, 2).map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">
                {s?.title || "Ohne Titel"}
              </h3>
              {expertName && (
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                  <Image
                    src={expertAvatar || "/avatar.png"}
                    alt={expertName}
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <span>mit {expertName}</span>
                </div>
              )}
            </div>
            <StarRating
              value={expertRatingAvg ?? undefined}
              count={expertRatingCount ?? undefined}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700 ring-1 ring-slate-200">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {bookedCount} gebucht
              {typeof capacity === "number" ? ` · ${capacity} Plätze` : ""}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-700 ring-1 ring-slate-200">
              {s?.session_type ?? "Session"}
            </span>
            <span className="ml-auto text-slate-900 font-medium">{price}</span>
          </div>

          {!!s?.tags?.length && (
            <div className="flex flex-wrap gap-1">
              {(s.tags ?? []).slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700 ring-1 ring-slate-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
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
                  className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {pendingCancel ? "Storniere…" : "Session canceln"}
                </button>
              </form>
            ) : (
              <form action={bookAction} className="col-span-2 sm:col-span-1">
                <input
                  type="hidden"
                  name="occurrenceId"
                  value={occurrence.id}
                />
                <input type="hidden" name="path" value={path} />
                <button
                  type="submit"
                  disabled={pendingBook}
                  className="w-full rounded-lg bg-yuvi-skyblue px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {pendingBook ? "Bitte warten…" : "Jetzt buchen"}
                </button>
                {bookState && "ok" in bookState && !bookState.ok && (
                  <p className="mt-2 text-xs text-rose-600">
                    {bookState.error}
                  </p>
                )}
              </form>
            )}

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
      </div>

      {/* ✅ EIN Dialog, mit animiertem Content via Framer Motion */}
      <Dialog
        open={openSuccess}
        onOpenChange={(next) => {
          setOpenSuccess(next);
          if (!next) router.refresh(); // refresh erst beim Schließen
        }}
      >
        <DialogContent className="sm:max-w-md">
          <motion.div
            key={openSuccess ? "open" : "closed"}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <motion.svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-emerald-600"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              >
                <path
                  d="M20 7L9 18l-5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </div>

            <DialogTitle className="text-base">Buchung erfolgreich</DialogTitle>
            <div className="mt-2 text-sm text-slate-600">
              Deine Session
              {s?.title ? (
                <>
                  {" "}
                  <strong>„{s.title}“</strong>
                </>
              ) : null}{" "}
              ist gebucht. Du findest sie in deinem Dashboard.
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
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white"
              >
                Zum Dashboard
              </a>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
