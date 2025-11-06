"use client";

import clsx from "clsx";
import { useId } from "react";
import type { Enums } from "@/types/supabase";

export type SessionType = Enums<"session_type">; // "private" | "group" | "trainWithMe"

type Props = {
  value: SessionType | "";
  onChange: (v: SessionType) => void;
};

export default function StepSessionType({ value, onChange }: Props) {
  const name = useId();
  const TYPES: readonly SessionType[] = [
    "private",
    "group",
    "trainWithMe",
  ] as const;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">
        1) Session-Typ wählen
      </h3>

      <fieldset className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <legend className="sr-only">Session-Typ</legend>
        {TYPES.map((t) => (
          <label
            key={t}
            className={clsx(
              "cursor-pointer rounded-lg border px-3 py-2 text-sm",
              value === t
                ? "border-black ring-1 ring-black"
                : "hover:bg-slate-50"
            )}
          >
            <input
              type="radio"
              name={name}
              value={t}
              checked={value === t}
              onChange={() => onChange(t)}
              className="mr-2"
            />
            {t === "private"
              ? "Private Session"
              : t === "group"
              ? "Group Session"
              : "Train With Me"}
          </label>
        ))}
      </fieldset>
    </section>
  );
}
