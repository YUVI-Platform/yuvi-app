"use client";

import clsx from "clsx";

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

  // optionale Felder – nur anzeigen, wenn vorhanden
  allowed_tags?: string[] | null;
  amenities?: string[] | null;
  price_per_slot?: number | null; // cents
  house_rules?: string | null;
};

export default function StudioPreviewDialog({
  open,
  onClose,
  location,
}: {
  open: boolean;
  onClose: () => void;
  location: LocationOption | null;
}) {
  if (!open || !location) return null;
  const img = location.image_urls?.[0] || "/placeholder.jpg";
  const addr = location.address;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">
            {location.title ?? "Studio"}
          </h4>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Schließen
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="h-full w-full object-cover" />
          </div>

          <div className="text-sm text-slate-700">
            <div className="font-medium">Adresse</div>
            <div className="text-slate-600">
              {addr?.street ? `${addr.street}, ` : ""}
              {addr?.zip ? `${addr.zip} ` : ""}
              {addr?.city ?? ""}
              {addr?.country ? `, ${addr.country}` : ""}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
            <InfoBox
              label="Kapazität"
              value={
                typeof location.max_participants === "number"
                  ? `${location.max_participants} Personen`
                  : "—"
              }
            />
            <InfoBox
              label="Preis pro Slot"
              value={
                typeof location.price_per_slot === "number"
                  ? `${(location.price_per_slot / 100).toFixed(2)}€`
                  : "—"
              }
            />
            <InfoBox
              label="Tags"
              value={
                Array.isArray(location.allowed_tags) &&
                location.allowed_tags.length
                  ? location.allowed_tags.map((t) => `#${t}`).join(" ")
                  : "—"
              }
            />
          </div>

          {Array.isArray(location.amenities) &&
            location.amenities.length > 0 && (
              <div className="text-sm">
                <div className="font-medium">Ausstattung</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {location.amenities.map((a) => (
                    <span
                      key={a}
                      className={clsx(
                        "rounded-full px-2.5 py-1 text-xs ring-1 ring-inset",
                        "bg-slate-50 text-slate-700 ring-slate-200"
                      )}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {location.house_rules && (
            <div className="text-sm">
              <div className="font-medium">Hausregeln</div>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">
                {location.house_rules}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-slate-800">{value}</div>
    </div>
  );
}
