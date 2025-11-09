// src/app/(protected)/dashboard/motionexpert/sessions/new/ui/NewSessionWizard.tsx
"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import StepSessionType, { SessionType } from "./StepSessionType";
import StepLocationType, { LocationType } from "./StepLocationType";
import StepSlotPicker, { StudioSlot } from "./StepSlotPicker";
import StepSessionDetails, { SessionDetails } from "./StepSessionDetails";
import StepPreview from "./StepPreview";

export type LocationOption = {
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
  price_per_slot: number | null;
};

type Steps = 1 | 2 | 3 | 4 | 5;

export default function NewSessionWizard({
  locations,
}: {
  locations: LocationOption[];
}) {
  const [step, setStep] = useState<Steps>(1);

  const [sessionType, setSessionType] = useState<SessionType | "">("");
  const [locationType, setLocationType] = useState<LocationType>("");
  const [studioId, setStudioId] = useState<string | null>(null);

  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<StudioSlot[]>([]);

  const [details, setDetails] = useState<SessionDetails>({
    title: "",
    description: "",
    duration_min: 60,
    capacity: null,
    tags: [],
    price_cents: null,
    image_url: null,
    recommended_level: null, // ✅ neu
  });
  const [detailsValid, setDetailsValid] = useState(false);

  const canNextFrom1 = useMemo(() => !!sessionType, [sessionType]);

  const canNextFrom2 = useMemo(() => {
    if (locationType === "self_hosted") return true;
    if (locationType === "studio_location") return !!studioId;
    return false;
  }, [locationType, studioId]);

  const canNextFrom3 = useMemo(() => {
    if (locationType === "studio_location") return selectedSlotIds.length > 0;
    return true;
  }, [locationType, selectedSlotIds]);

  const canNextFrom4 = detailsValid;

  const pickedStudio = useMemo(
    () => (studioId ? locations.find((l) => l.id === studioId) ?? null : null),
    [studioId, locations]
  );

  return (
    <div className="rounded-2xl border bg-white p-5">
      <StepsIndicator current={step} />

      {step === 1 && (
        <StepSessionType value={sessionType} onChange={setSessionType} />
      )}

      {step === 2 && (
        <StepLocationType
          locations={locations}
          locationType={locationType}
          selectedStudioId={studioId}
          onChangeLocationType={(v) => {
            setLocationType(v);
            setStudioId(null);
            setSelectedSlotIds([]);
            setSelectedSlots([]);
          }}
          onPickStudio={(id) => {
            setStudioId(id);
            setSelectedSlotIds([]);
            setSelectedSlots([]);
          }}
        />
      )}

      {step === 3 && (
        <>
          {locationType === "studio_location" && studioId ? (
            <StepSlotPicker
              locationId={studioId}
              selectedSlotIds={selectedSlotIds}
              onChangeSelected={(slots, ids) => {
                setSelectedSlots(slots);
                setSelectedSlotIds(ids);
              }}
            />
          ) : (
            <div className="rounded-md border p-3 text-sm text-slate-600">
              (Self-Hosted) — Hier würdest du eigene Location & Slots anlegen.
            </div>
          )}
        </>
      )}

      {step === 4 && (
        <StepSessionDetails
          // Bevorzugt die fertige Location übergeben (inkl. max + price)
          location={
            locationType === "studio_location" && pickedStudio
              ? {
                  id: pickedStudio.id,
                  max_participants: pickedStudio.max_participants,
                  price_per_slot: pickedStudio.price_per_slot ?? null,
                  title: pickedStudio.title,
                }
              : null
          }
          // Fallback: zusätzlich (oder alternativ) die ID durchreichen
          locationId={
            locationType === "studio_location"
              ? studioId ?? undefined
              : undefined
          }
          defaultValues={details}
          onChange={setDetails}
          onValidChange={setDetailsValid}
        />
      )}

      {step === 5 && (
        <StepPreview
          sessionType={sessionType}
          locationType={locationType}
          studio={locationType === "studio_location" ? pickedStudio : null}
          selectedSlotIds={selectedSlotIds}
          selectedSlots={selectedSlots}
          details={details}
        />
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Steps) : s))}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Zurück
        </button>

        {step === 1 && (
          <button
            type="button"
            disabled={!canNextFrom1}
            onClick={() => setStep(2)}
            className={clsx(
              "rounded-md px-4 py-2 text-sm text-white",
              canNextFrom1
                ? "bg-black hover:bg-black/90"
                : "bg-black/40 cursor-not-allowed"
            )}
          >
            Weiter
          </button>
        )}

        {step === 2 && (
          <button
            type="button"
            disabled={!canNextFrom2}
            onClick={() => setStep(3)}
            className={clsx(
              "rounded-md px-4 py-2 text-sm text-white",
              canNextFrom2
                ? "bg-black hover:bg-black/90"
                : "bg-black/40 cursor-not-allowed"
            )}
          >
            Weiter
          </button>
        )}

        {step === 3 && (
          <button
            type="button"
            disabled={!canNextFrom3}
            onClick={() => setStep(4)}
            className={clsx(
              "rounded-md px-4 py-2 text-sm text-white",
              canNextFrom3
                ? "bg-black hover:bg-black/90"
                : "bg-black/40 cursor-not-allowed"
            )}
          >
            Weiter
          </button>
        )}

        {step === 4 && (
          <button
            type="button"
            disabled={!canNextFrom4}
            onClick={() => setStep(5)}
            className={clsx(
              "rounded-md px-4 py-2 text-sm text-white",
              canNextFrom4
                ? "bg-black hover:bg-black/90"
                : "bg-black/40 cursor-not-allowed"
            )}
          >
            Vorschau
          </button>
        )}

        {step === 5 && <div />}
      </div>

      {/* ✅ Checkliste / Fortschritt */}
      <WizardChecklist
        sessionType={sessionType}
        locationType={locationType}
        studio={pickedStudio}
        selectedSlotCount={selectedSlotIds.length}
        details={details}
        detailsValid={detailsValid}
      />
    </div>
  );
}

function StepsIndicator({ current }: { current: Steps }) {
  const steps: { n: Steps; label: string }[] = [
    { n: 1, label: "Session-Typ" },
    { n: 2, label: "Location-Typ" },
    { n: 3, label: "Slots" },
    { n: 4, label: "Details" },
    { n: 5, label: "Vorschau" },
  ];
  return (
    <ol className="mb-5 flex items-center gap-3 text-sm">
      {steps.map((s) => (
        <li
          key={s.n}
          className={clsx(
            "rounded-full px-3 py-1 ring-1 ring-inset",
            current === s.n
              ? "bg-black text-white ring-black"
              : "bg-slate-50 text-slate-700 ring-slate-200"
          )}
        >
          {s.n}. {s.label}
        </li>
      ))}
    </ol>
  );
}

/* --- Checkliste Component --- */
function WizardChecklist({
  sessionType,
  locationType,
  studio,
  selectedSlotCount,
  details,
  detailsValid,
}: {
  sessionType: SessionType | "";
  locationType: LocationType;
  studio: LocationOption | null;
  selectedSlotCount: number;
  details: SessionDetails;
  detailsValid: boolean;
}) {
  const items = useMemo(() => {
    const toLevel = (lvl?: string | null) =>
      lvl === "beginner"
        ? "Anfänger"
        : lvl === "intermediate"
        ? "Fortgeschritten"
        : lvl === "advanced"
        ? "Experte"
        : "—";

    const base: { label: string; ok: boolean; hint?: string }[] = [];

    base.push({
      label: "Session-Typ gewählt",
      ok: !!sessionType,
      hint: sessionType || "—",
    });
    base.push({
      label: "Location-Typ gewählt",
      ok: !!locationType,
      hint:
        locationType === "studio_location"
          ? "Studio-Location"
          : locationType === "self_hosted"
          ? "Self-Hosted"
          : "—",
    });

    if (locationType === "studio_location") {
      base.push({
        label: "Studio ausgewählt",
        ok: !!studio,
        hint: studio?.title || "—",
      });
      base.push({
        label: "Slots ausgewählt",
        ok: selectedSlotCount > 0,
        hint: selectedSlotCount ? `${selectedSlotCount} Slot(s)` : "—",
      });
    }

    base.push({
      label: "Details vollständig",
      ok: detailsValid,
      hint: detailsValid ? "OK" : "Bitte prüfen",
    });
    base.push({
      label: "Titel",
      ok: details.title.trim().length >= 3,
      hint: details.title ? `"${details.title.trim()}"` : "—",
    });
    base.push({
      label: "Dauer (Min.)",
      ok: Number.isFinite(details.duration_min) && details.duration_min > 0,
      hint: String(details.duration_min ?? "—"),
    });
    base.push({
      label: "Preis",
      ok: details.price_cents == null || details.price_cents >= 0,
      hint:
        details.price_cents == null
          ? "— (von Location übernehmen)"
          : `${(details.price_cents / 100).toFixed(2)} €`,
    });
    base.push({
      label: "Tags",
      ok: (details.tags?.length ?? 0) > 0,
      hint: details.tags?.length ? `${details.tags.length} Tag(s)` : "—",
    });
    base.push({
      label: "Bild",
      ok: !!details.image_url,
      hint: details.image_url ? "gesetzt" : "—",
    });
    base.push({
      label: "Fitness Level",
      ok: !!details.recommended_level,
      hint: toLevel(details.recommended_level),
    }); // ✅ neu

    return base;
  }, [
    sessionType,
    locationType,
    studio,
    selectedSlotCount,
    details,
    detailsValid,
  ]);

  const total = items.length;
  const done = items.filter((i) => i.ok).length;
  const percent = Math.round((done / Math.max(total, 1)) * 100);

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Checkliste</h4>
        <span className="text-xs text-slate-600">
          {done}/{total} erledigt ({percent}%)
        </span>
      </div>

      <div className="relative h-2 w-full rounded-full bg-slate-100">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-emerald-500 transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {items.map((it, idx) => (
          <li
            key={idx}
            className={clsx(
              "flex items-center justify-between rounded-md border px-3 py-2 text-xs",
              it.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-slate-50 text-slate-700"
            )}
          >
            <span className="mr-2 truncate">
              {it.ok ? "✓" : "•"} {it.label}
            </span>
            <span className="ml-2 truncate opacity-70">{it.hint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
