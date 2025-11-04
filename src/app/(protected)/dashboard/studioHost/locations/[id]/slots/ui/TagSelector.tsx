"use client";

import { useEffect, useState } from "react";

export default function TagSelector({
  name = "allowed_tags_json",
  options,
  initial = [],
}: {
  name?: string; // Name des Hidden-Fields
  options: string[]; // z.B. ["Yoga","HIIT",...]
  initial?: string[]; // vorselektierte Tags
}) {
  const [selected, setSelected] = useState<string[]>(initial);

  // Hidden-Field Wert immer als JSON halten
  useEffect(() => {
    const el = document.querySelector<HTMLInputElement>(
      `input[name="${name}"]`
    );
    if (el) el.value = JSON.stringify(selected);
  }, [name, selected]);

  function toggle(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Hidden field, das ans Server-Action-Formular geschickt wird */}
      <input type="hidden" name={name} defaultValue={JSON.stringify(initial)} />

      {options.map((t) => {
        const active = selected.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={
              "rounded-full border px-3 py-1 text-sm transition " +
              (active
                ? "bg-black text-white border-black"
                : "bg-white text-slate-700 hover:bg-slate-50")
            }
            aria-pressed={active}
          >
            #{t}
          </button>
        );
      })}
    </div>
  );
}
