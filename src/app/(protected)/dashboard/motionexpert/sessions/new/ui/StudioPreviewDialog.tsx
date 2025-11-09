// src/app/(protected)/dashboard/studiohost/locations/new/ui/StudioPreviewDialog.tsx
"use client";

import clsx from "clsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

  // optionale Felder
  allowed_tags?: string[] | null;
  amenities?: string[] | null;
  price_per_slot?: number | null; // cents
  house_rules?: string | null;

  // weitere optionale Felder (falls du sie selektierst)
  area_sqm?: number | null;
  is_draft?: boolean | null;
  verification?: "unverified" | "pending" | "verified" | null;
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
  if (!location) return null;

  const imgs = location.image_urls ?? [];
  const cover = imgs[0] || "/placeholder.jpg";
  const addr = location.address;
  const addrText = [
    addr?.street,
    [addr?.zip, addr?.city].filter(Boolean).join(" "),
    addr?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const gmapsUrl = addrText
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        addrText
      )}`
    : null;

  const priceText =
    typeof location.price_per_slot === "number"
      ? new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 2,
        }).format(location.price_per_slot / 100)
      : "—";

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-4xl font-semibold font-fancy text-yuvi-skyblue">
                {location?.title?.toUpperCase() ?? "STUDIO"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {addrText || "Adresse nicht angegeben"}
              </DialogDescription>
            </div>

            {/* Badges rechts */}
            <div className="flex flex-wrap items-center gap-2">
              {location.is_draft ? <Badge tone="amber">Entwurf</Badge> : null}
              {location.verification ? (
                <Badge
                  tone={
                    location.verification === "verified"
                      ? "green"
                      : location.verification === "pending"
                      ? "yellow"
                      : "gray"
                  }
                >
                  {location.verification === "verified"
                    ? "Verifiziert"
                    : location.verification === "pending"
                    ? "Prüfung läuft"
                    : "Unverifiziert"}
                </Badge>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Cover */}
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="h-full w-full object-cover" />
          </div>

          {/* Thumbnails (wenn vorhanden) */}
          {imgs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imgs.slice(1).map((u) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={u}
                  src={u}
                  alt=""
                  className="h-16 w-28 flex-none rounded-md object-cover ring-1 ring-slate-200"
                />
              ))}
            </div>
          )}

          {/* Facts */}
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <InfoBox
              label="Kapazität"
              value={
                typeof location.max_participants === "number"
                  ? `${location.max_participants} Personen`
                  : "—"
              }
            />
            <InfoBox label="Preis pro Slot" value={priceText} />
            <InfoBox
              label="Fläche"
              value={
                typeof location.area_sqm === "number"
                  ? `${location.area_sqm} m²`
                  : "—"
              }
            />
          </div>

          {/* Tags */}
          <LabeledChips
            label="Tags"
            items={location.allowed_tags ?? []}
            emptyText="—"
            prefixHash
          />

          {/* Ausstattung */}
          <LabeledChips
            label="Ausstattung"
            items={location.amenities ?? []}
            emptyText="—"
          />

          {/* Hausregeln */}
          {location.house_rules ? (
            <div className="text-sm">
              <div className="font-medium">Hausregeln</div>
              <p className="mt-1 whitespace-pre-wrap text-slate-700">
                {location.house_rules}
              </p>
            </div>
          ) : null}

          {/* Aktionen */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
            >
              Schließen
            </button>

            {gmapsUrl && (
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-black px-3 py-2 text-sm text-white"
              >
                Route öffnen
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
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

function LabeledChips({
  label,
  items,
  emptyText = "—",
  prefixHash = false,
}: {
  label: string;
  items: string[];
  emptyText?: string;
  prefixHash?: boolean;
}) {
  const has = Array.isArray(items) && items.length > 0;
  return (
    <div className="text-sm">
      <div className="font-medium">{label}</div>
      {has ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {items.map((t) => (
            <span
              key={t}
              className={clsx(
                "rounded-full px-2.5 py-1 text-xs ring-1 ring-inset",
                "bg-slate-50 text-slate-700 ring-slate-200"
              )}
            >
              {prefixHash ? `#${t}` : t}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-1 text-slate-600">{emptyText}</div>
      )}
    </div>
  );
}

function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "green" | "yellow" | "amber";
}) {
  const tones: Record<string, string> = {
    gray: "bg-slate-100 text-slate-700 ring-slate-200",
    green: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    yellow: "bg-yellow-100 text-yellow-800 ring-yellow-200",
    amber: "bg-amber-100 text-amber-800 ring-amber-200",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 ring-inset",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
