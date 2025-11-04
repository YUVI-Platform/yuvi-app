"use client";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";
import StarRating from "./StarRating";

export type StudioCardProps = {
  name: string;
  address: string;
  size: string;
  availableFrom?: string;
  availableTo?: string;
  features?: string[];
  rating?: number;
  imageUrl?: string;
  className?: string;
};

function StudioCard({
  name,
  address,
  size,
  availableFrom,
  availableTo,
  features = [],
  rating = 0,
  imageUrl = "/placeholder.jpg",
  className,
}: StudioCardProps) {
  return (
    <div
      className={cn(
        "w-[340px] overflow-hidden rounded-2xl border bg-white",
        className
      )}
    >
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="340px"
        />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold">{name}</h3>
          <StarRating value={rating} />
        </div>
        <p className="text-sm text-slate-600">{address}</p>
        <div className="text-xs text-slate-500">
          <span className="mr-2">{size}</span>
          {availableFrom && (
            <span>
              • {availableFrom}
              {availableTo ? ` – ${availableTo}` : ""}
            </span>
          )}
        </div>
        {!!features.length && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {features.map((f) => (
              <span
                key={f}
                className="rounded-full border px-2 py-0.5 text-xs text-slate-700"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudioCard;
export { StudioCard };
