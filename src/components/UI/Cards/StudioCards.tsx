// src/components/ui/Cards/StudioCards.tsx
"use client";

import clsx from "clsx";
import Image from "next/image";
import * as React from "react";

export type StudioCardProps = {
  name: string;
  address?: string;
  size?: string;
  /** z. B. "Feb.25" */
  availableFrom?: string;
  /** z. B. "Mar.26, 2025" */
  availableTo?: string;
  /** Ausstattungen / Merkmale */
  features?: string[];
  /** 0–5 */
  rating?: number;
  imageUrl?: string;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
};

function Stars({ value = 0 }: { value?: number }) {
  const v = Math.max(0, Math.min(5, Math.floor(value || 0)));
  return (
    <div
      className="inline-flex gap-0.5 text-amber-500"
      aria-label={`${v} Sterne`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < v ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export function StudioCard({
  name,
  address,
  size,
  availableFrom,
  availableTo,
  features = [],
  rating = 0,
  imageUrl,
  selected = false,
  className,
  onClick,
}: StudioCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={clsx(
        "flex gap-3 rounded-xl border bg-white p-3 transition",
        selected ? "ring-2 ring-black" : "hover:bg-slate-50",
        className
      )}
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-24">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-slate-400">
            No img
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium">{name}</p>
          <Stars value={rating} />
        </div>

        {address && (
          <p className="truncate text-xs text-slate-600">{address}</p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          {size && <span>{size}</span>}
          {(availableFrom || availableTo) && (
            <span className="truncate">
              • Verfügbar: {availableFrom ?? "—"}{" "}
              {availableTo ? `– ${availableTo}` : ""}
            </span>
          )}
        </div>

        {!!features.length && (
          <div className="mt-2 flex flex-wrap gap-1">
            {features.slice(0, 6).map((f) => (
              <span
                key={f}
                className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700 ring-1 ring-inset ring-slate-200"
              >
                {f}
              </span>
            ))}
            {features.length > 6 && (
              <span className="text-[10px] text-slate-500">
                +{features.length - 6}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudioCard;
