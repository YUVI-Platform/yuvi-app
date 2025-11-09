// src/app/(protected)/dashboard/motionexpert/sessions/new/ui/StepLocationType.tsx
"use client";

import clsx from "clsx";
import { useId, useState } from "react";
import type { Enums } from "@/types/supabase";
import StudioPreviewDialog, { LocationOption } from "./StudioPreviewDialog";

type LocationTypeEnum = Enums<"location_type">; // "self_hosted" | "studio_location"

export type LocationType = LocationTypeEnum | ""; // Wizard darf "" als initial haben

type Props = {
  locations: LocationOption[];
  locationType: LocationType;
  selectedStudioId: string | null | undefined;
  onChangeLocationType: (v: LocationType) => void;
  onPickStudio: (id: string) => void;
};

export default function StepLocationType({
  locations,
  locationType,
  selectedStudioId,
  onChangeLocationType,
  onPickStudio,
}: Props) {
  const groupName = useId();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoc, setPreviewLoc] = useState<LocationOption | null>(null);

  const OPTIONS: readonly LocationTypeEnum[] = [
    "studio_location",
    "self_hosted",
  ] as const;

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">
          2) Location-Typ wählen
        </h3>

        <fieldset className="flex flex-wrap gap-3">
          <legend className="sr-only">Location-Typ</legend>
          {OPTIONS.map((t) => {
            const id = `${groupName}-${t}`;
            return (
              <label
                key={t}
                htmlFor={id}
                className={clsx(
                  "cursor-pointer rounded-lg border px-3 py-2 text-sm",
                  locationType === t
                    ? "border-black ring-1 ring-black"
                    : "hover:bg-slate-50"
                )}
              >
                <input
                  id={id}
                  type="radio"
                  name={groupName}
                  value={t}
                  checked={locationType === t}
                  onChange={() => onChangeLocationType(t)}
                  className="mr-2"
                />
                {t === "studio_location" ? "Studio-Location" : "Self-Hosted"}
              </label>
            );
          })}
        </fieldset>
      </div>

      {locationType === "studio_location" && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Wähle eine veröffentlichte Location. (Verfügbare Slots kommen als
            Nächstes.)
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {locations.map((l) => {
              const picked = selectedStudioId === l.id;
              const addr = l.address;
              const img =
                (l.image_urls && l.image_urls[0]) || "/placeholder.jpg";
              const slot_price =
                typeof l.price_per_slot === "number"
                  ? new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 2,
                    }).format(l.price_per_slot / 100)
                  : "—";
              return (
                <article
                  key={l.id}
                  className={clsx(
                    "rounded-xl border p-3 focus-within:ring-2 focus-within:ring-black",
                    picked ? "ring-2 ring-black" : "hover:bg-slate-50"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onPickStudio(l.id)}
                    className="block w-full text-left"
                    title="Diese Location auswählen"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="font-medium">{l.title ?? "Ohne Titel"}</div>
                    <div className="text-xs text-slate-600">
                      {addr?.street ? `${addr.street}, ` : ""}
                      {addr?.zip ? `${addr.zip} ` : ""}
                      {addr?.city ?? ""}
                      {addr?.country ? `, ${addr.country}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Kapazität:{" "}
                      {typeof l.max_participants === "number"
                        ? l.max_participants
                        : "—"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Slot-Preis: {slot_price}
                      EUR
                    </div>
                  </button>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-100"
                      onClick={() => onPickStudio(l.id)}
                    >
                      Auswählen
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-100"
                      onClick={() => {
                        setPreviewLoc(l);
                        setPreviewOpen(true);
                      }}
                    >
                      Vorschau
                    </button>
                  </div>
                </article>
              );
            })}

            {!locations.length && (
              <div className="col-span-full rounded-md border p-3 text-sm text-slate-500">
                Keine veröffentlichten Locations gefunden.
              </div>
            )}
          </div>
        </div>
      )}

      {locationType === "self_hosted" && (
        <div className="rounded-md border p-3 text-sm text-slate-600">
          Du hast <b>Self-Hosted</b> gewählt. Im nächsten Schritt erfasst du
          deine eigene Location (Titel, Adresse, Bilder) und legst die Slots an.
        </div>
      )}

      <StudioPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        location={previewLoc}
      />
    </section>
  );
}
