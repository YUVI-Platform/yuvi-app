// src/components/ui/Cards/StarRating.tsx
"use client";

import clsx from "clsx";
import * as React from "react";

export type StarRatingProps = {
  /** Du kannst wahlweise `value` oder `rating` übergeben */
  value?: number;
  rating?: number;
  outOf?: number;
  onChange?: (v: number) => void;
  className?: string;
  sizePx?: number;
};

export function StarRating({
  value,
  rating,
  outOf = 5,
  onChange,
  className,
  sizePx = 16,
}: StarRatingProps) {
  const effective = value ?? rating ?? 0;
  const v = Math.max(0, Math.min(outOf, Math.round(effective)));

  return (
    <div
      className={clsx("inline-flex items-center gap-0.5", className)}
      aria-label={`${v}/${outOf} stars`}
      style={{ fontSize: sizePx }}
    >
      {Array.from({ length: outOf }).map((_, i) => {
        const filled = i < v;

        // getrennte Branches -> keine union-Prop-Probleme, kein `any`
        if (onChange) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className="cursor-pointer select-none leading-none"
              aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
            >
              {filled ? "★" : "☆"}
            </button>
          );
        }

        return (
          <span
            key={i}
            className="leading-none"
            aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
          >
            {filled ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;
