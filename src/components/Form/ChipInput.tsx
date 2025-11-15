// src/components/form/ChipInput.tsx
"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";

type Props = {
  name: string; // Hidden input name (JSON)
  defaultValues?: string[];
  placeholder?: string;
  suggestions?: string[];
  label?: string;
  className?: string;
};

export default function ChipInput({
  name,
  defaultValues = [],
  placeholder = "Eintrag hinzufügen und Enter drücken…",
  suggestions = [],
  label,
  className,
}: Props) {
  const [chips, setChips] = React.useState<string[]>(defaultValues);
  const [value, setValue] = React.useState("");

  function addChip(v: string) {
    const clean = v.trim();
    if (!clean) return;
    setChips((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    setValue("");
  }
  function removeChip(v: string) {
    setChips((prev) => prev.filter((c) => c !== v));
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addChip(value);
    } else if (e.key === "Backspace" && !value && chips.length) {
      // Backspace auf leerem Input entfernt letzte Chip
      setChips((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div className={className}>
      {label && <div className="mb-1 text-slate-700 text-sm">{label}</div>}
      {/* Hidden JSON-Feld für Server Action */}
      <input type="hidden" name={name} value={JSON.stringify(chips)} />

      <div className="flex flex-wrap gap-2 rounded-md border bg-white p-2">
        {chips.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs"
          >
            {c}
            <button
              type="button"
              onClick={() => removeChip(c)}
              className="rounded-full p-0.5 hover:bg-slate-200"
              aria-label={`Entferne ${c}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}

        <input
          className="flex-1 min-w-[160px] outline-none text-sm bg-transparent"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />

        {!!value && (
          <button
            type="button"
            onClick={() => addChip(value)}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
            aria-label="Chip hinzufügen"
          >
            <Plus size={14} />
            Hinzufügen
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addChip(s)}
              className="rounded-full bg-slate-50 hover:bg-slate-100 px-2 py-1 text-xs border"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

//TODO: ordner einheitlich benene
//TODO: Sprache vereinheitlichen
//TODO: Wording für DX verbessern
