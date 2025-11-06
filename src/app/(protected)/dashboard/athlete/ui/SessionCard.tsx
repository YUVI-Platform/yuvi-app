"use client";

import clsx from "clsx";

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

export default function SessionCard({
  occurrence,
  highlight,
  cta,
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
        address?: any;
        image_urls?: string[] | null;
      } | null;
    } | null;
  };
  highlight?: boolean;
  cta?: "Buchen" | "Details" | "Cancel";
}) {
  const s = occurrence.sessions;
  const img =
    s?.image_urls?.[0] ||
    occurrence.studio_slots?.studio_locations?.image_urls?.[0] ||
    "/placeholder.jpg";

  const price =
    typeof s?.price_cents === "number"
      ? `${(s!.price_cents / 100).toFixed(2)} €`
      : "—";

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

        <div className="pt-2">
          <button
            type="button"
            className="w-full rounded-lg bg-black px-4 py-2 text-white text-sm hover:bg-black/90"
          >
            {cta ?? "Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
