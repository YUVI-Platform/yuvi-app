// src/app/dashboard/studiohost/locations/ui/LocationsClient.tsx
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import clsx from "clsx";
import type { LocationRow } from "../page";
import { toggleDraft } from "../actions";
import { useFormStatus } from "react-dom";

export default function LocationsClient({ items }: { items: LocationRow[] }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "published" | "draft">("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      const matchesTab =
        tab === "all" ? true : tab === "draft" ? !!it.is_draft : !it.is_draft;
      const hay = `${it.title ?? ""} ${it.description ?? ""} ${
        it.address?.city ?? ""
      } ${(it.allowed_tags ?? []).join(" ")} ${(it.amenities ?? []).join(
        " "
      )}`.toLowerCase();
      const matchesQ = !term || hay.includes(term);
      return matchesTab && matchesQ;
    });
  }, [items, q, tab]);

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((k) => (
            <button
              key={k}
              className={clsx(
                "rounded-full px-3 py-1 text-sm ring-1 ring-inset",
                tab === k
                  ? "bg-black text-white ring-black"
                  : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
              )}
              onClick={() => setTab(k)}
            >
              {k === "all"
                ? "Alle"
                : k === "published"
                ? "Veröffentlicht"
                : "Entwürfe"}
            </button>
          ))}
        </div>

        <input
          placeholder="Suche nach Titel, Stadt, Tag…"
          className="w-full rounded-md border px-3 py-2 sm:w-80"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-slate-600">
          Keine Locations gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((loc) => (
            <LocationCard key={loc.id} loc={loc} />
          ))}
        </div>
      )}
    </>
  );
}

function LocationCard({ loc }: { loc: LocationRow }) {
  const thumb = loc.image_urls?.[0] || "";
  const city = loc.address?.city ?? "";
  const cap = loc.max_participants ?? undefined;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-white ring-1 ring-black/5">
      {/* Thumbnail */}
      <div className="relative h-40 w-full bg-slate-100">
        {thumb ? (
          <Image
            src={thumb}
            alt={loc.title ?? "Location"}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-400">
            Kein Bild
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge
            tone={loc.is_draft ? "slate" : "emerald"}
            text={loc.is_draft ? "Entwurf" : "Live"}
          />
          {loc.verification && (
            <Badge tone="indigo" text={`Verify: ${loc.verification}`} />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 text-base font-semibold">
              {loc.title || "Ohne Titel"}
            </h3>
            <p className="text-sm text-slate-500">{city}</p>
          </div>
          {typeof cap === "number" && (
            <span className="shrink-0 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700 ring-1 ring-inset ring-slate-200">
              max {cap}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {(loc.allowed_tags ?? []).slice(0, 6).map((t) => (
            <span
              key={t}
              className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-inset ring-emerald-200"
            >
              #{t}
            </span>
          ))}
          {(loc.allowed_tags?.length ?? 0) > 6 && (
            <span className="text-xs text-slate-400">+ mehr</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <a
            href={`/dashboard/studiohost/locations/${loc.id}/edit`}
            className="flex-1 rounded-md border px-3 py-1.5 text-center text-sm hover:bg-slate-50"
          >
            Bearbeiten
          </a>
          <a
            href={`/dashboard/studiohost/locations/${loc.id}`}
            className="flex-1 rounded-md border px-3 py-1.5 text-center text-sm hover:bg-slate-50"
          >
            Vorschau
          </a>

          <form action={toggleDraft}>
            <input type="hidden" name="id" value={loc.id} />
            {/* Wir reichen den Zielzustand mit – MVP ist ok */}
            <input
              type="hidden"
              name="next_draft"
              value={(!loc.is_draft).toString()}
            />
            <ButtonPending className="rounded-md bg-black px-3 py-1.5 text-sm text-white">
              {loc.is_draft ? "Veröffentlichen" : "Als Entwurf"}
            </ButtonPending>
          </form>
        </div>
      </div>
    </div>
  );
}

function Badge({
  tone,
  text,
}: {
  tone: "slate" | "emerald" | "indigo";
  text: string;
}) {
  const cls =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "indigo"
      ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span
      className={clsx(
        "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        cls
      )}
    >
      {text}
    </span>
  );
}

function ButtonPending({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={clsx(className, pending && "opacity-60")}
      disabled={pending}
    >
      {pending ? "…" : children}
    </button>
  );
}
