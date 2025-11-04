"use client";
import * as React from "react";
import { Star } from "feather-icons-react";
import { cn } from "@/lib/utils";

type Props = {
  value?: number; // bevorzugt
  rating?: number; // legacy alias
  outOf?: number;
  className?: string;
};

const StarRating: React.FC<Props> = ({
  value,
  rating,
  outOf = 5,
  className,
}) => {
  const val = typeof rating === "number" ? rating : value ?? 0;
  const full = Math.floor(val);
  const rest = Math.max(0, Math.min(1, val - full));

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${val} von ${outOf} Sternen`}
    >
      {Array.from({ length: outOf }).map((_, i) => {
        const fill = i < full ? 1 : i === full ? rest : 0;
        return (
          <span key={i} className="relative inline-block h-4 w-4">
            <Star size={16} className="absolute inset-0 text-slate-300" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star size={16} className="text-amber-500" />
            </span>
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
export { StarRating };
