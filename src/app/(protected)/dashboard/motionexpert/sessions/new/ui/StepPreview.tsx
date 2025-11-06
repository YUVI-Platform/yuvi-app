// src/app/(protected)/dashboard/motionexpert/sessions/new/ui/StepPreview.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { publishSessions } from "../actions";
import type { SessionType } from "./StepSessionType";
import type { LocationType } from "./StepLocationType";
import type { StudioSlot } from "./StepSlotPicker";
import type { SessionDetails } from "./StepSessionDetails";

type MinimalStudio = {
  id: string;
  title: string | null;
  address: {
    street?: string | null;
    zip?: string | null;
    city?: string | null;
    country?: string | null;
  } | null;
  image_urls: string[] | null;
  max_participants: number | null;
} | null;

type Props = {
  sessionType: SessionType | "";
  locationType: LocationType;
  studio: MinimalStudio;
  selectedSlotIds: string[];
  selectedSlots: StudioSlot[];
  details: SessionDetails;
};

function centsToEuro(cents: number | null | undefined) {
  if (cents == null) return "—";
  return `${(cents / 100).toFixed(2)} €`;
}
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
    year: "numeric",
  });
}
function levelLabel(level?: string | null) {
  switch (level) {
    case "beginner":
      return "Anfänger";
    case "intermediate":
      return "Fortgeschritten";
    case "advanced":
      return "Experte";
    default:
      return "—";
  }
}

export default function StepPreview({
  sessionType,
  locationType,
  studio,
  selectedSlotIds,
  selectedSlots,
  details,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showRaw, setShowRaw] = useState(false);

  const groupedSlots = useMemo(() => {
    const byDay = new Map<string, StudioSlot[]>();
    const sorted = [...selectedSlots].sort((a, b) =>
      a.starts_at.localeCompare(b.starts_at)
    );
    for (const s of sorted) {
      const key = s.starts_at.slice(0, 10);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(s);
    }
    return byDay;
  }, [selectedSlots]);

  const payload = useMemo(
    () => ({
      session: {
        session_type: sessionType,
        location_type: locationType,
        title: details.title,
        description: details.description ?? "",
        duration_minutes: details.duration_min,
        max_participants: details.capacity ?? undefined,
        price_cents: details.price_cents ?? undefined,
        tags: details.tags ?? [],
        image_urls: details.image_url ? [details.image_url] : [],
        equipment: [],
        is_draft: false,
        // Hinweis: recommended_level absichtlich NICHT gesendet,
        // falls dein Action-Schema das (noch) nicht kennt.
      },
      studioSlotIds: locationType === "studio_location" ? selectedSlotIds : [],
    }),
    [sessionType, locationType, details, selectedSlotIds]
  );

  const coverImage =
    details.image_url ||
    (studio?.image_urls && studio.image_urls[0]) ||
    "/placeholder.jpg";

  const studioAddress = studio?.address
    ? [
        studio.address.street || "",
        [studio.address.zip, studio.address.city].filter(Boolean).join(" "),
        studio.address.country || "",
      ]
        .filter(Boolean)
        .join(", ")
    : "—";

  const readyBadges = [
    { label: "Session-Typ", ok: !!sessionType },
    {
      label: "Location",
      ok: !!locationType && (locationType === "self_hosted" || !!studio),
    },
    {
      label: "Slots",
      ok: locationType === "self_hosted" ? true : selectedSlotIds.length > 0,
    },
    {
      label: "Details-Validierung",
      ok: !!details.title && details.duration_min > 0,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {readyBadges.map((b) => (
          <span
            key={b.label}
            className={
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 " +
              (b.ok
                ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                : "bg-slate-50 text-slate-700 ring-slate-200")
            }
          >
            {b.ok ? "✓" : "•"} {b.label}
          </span>
        ))}
      </div>

      {/* Preview Card */}
      <div className="overflow-hidden rounded-2xl border">
        <div className="aspect-[16/6] w-full bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImage} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="space-y-4 p-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">
              {details.title || "Ohne Titel"}
            </h3>
            <div className="text-xs text-slate-600">
              {sessionType === "private"
                ? "Private Session"
                : sessionType === "group"
                ? "Group Session"
                : sessionType === "trainWithMe"
                ? "Train With Me"
                : "—"}{" "}
              ·{" "}
              {locationType === "studio_location"
                ? "Studio-Location"
                : "Self-Hosted"}
            </div>
          </div>

          {details.description && (
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {details.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
            <InfoTile label="Dauer" value={`${details.duration_min} Min.`} />
            <InfoTile
              label="Kapazität"
              value={
                details.capacity != null
                  ? String(details.capacity)
                  : studio?.max_participants != null
                  ? String(studio.max_participants)
                  : "—"
              }
            />
            <InfoTile label="Preis" value={centsToEuro(details.price_cents)} />
            <InfoTile
              label="Tags"
              value={
                details.tags?.length ? `${details.tags.length} Tag(s)` : "—"
              }
            />
            <InfoTile
              label="Level"
              value={levelLabel(details.recommended_level)}
            />{" "}
            {/* ✅ neu */}
          </div>

          {!!details.tags?.length && (
            <div className="flex flex-wrap gap-2">
              {details.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Studio only */}
          {locationType === "studio_location" && studio && (
            <div className="rounded-xl border bg-slate-50 p-3">
              <div className="text-sm font-medium">
                {studio.title || "Studio ohne Titel"}
              </div>
              <div className="text-xs text-slate-600">{studioAddress}</div>

              <div className="mt-3">
                <div className="text-xs font-medium text-slate-700 mb-1">
                  Geplante Slots ({selectedSlotIds.length})
                </div>
                {selectedSlotIds.length === 0 ? (
                  <div className="text-xs text-slate-500">—</div>
                ) : (
                  <div className="space-y-2">
                    {[...groupedSlots.entries()].map(([day, slots]) => (
                      <div key={day} className="text-xs">
                        <div className="font-medium text-slate-800">
                          {fmtDay(slots[0].starts_at)}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {slots.map((s) => (
                            <span
                              key={s.id}
                              className="rounded-md border px-2 py-1"
                              title={`${fmtTime(s.starts_at)}–${fmtTime(
                                s.ends_at
                              )}`}
                            >
                              {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)}
                              {typeof s.capacity === "number"
                                ? ` · ${s.capacity}`
                                : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Publish */}
          <form
            action={(fd) => {
              fd.set("payload", JSON.stringify(payload));
              startTransition(async () => {
                await publishSessions(fd);
              });
            }}
          >
            <div className="mt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
              >
                {isPending ? "Veröffentliche…" : "Veröffentlichen"}
              </button>

              <button
                type="button"
                onClick={() => setShowRaw((s) => !s)}
                className="rounded-md border px-3 py-2 text-sm"
                aria-pressed={showRaw}
              >
                {showRaw ? "Payload ausblenden" : "Payload anzeigen"}
              </button>
            </div>
          </form>

          {showRaw && (
            <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
              {JSON.stringify(payload, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
