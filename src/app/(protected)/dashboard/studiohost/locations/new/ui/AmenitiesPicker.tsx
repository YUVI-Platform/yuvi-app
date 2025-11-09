"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

type Props = {
  name: string; // hidden input name
  options: string[];
  defaultSelected?: string[];
  label?: string;
};

export default function AmenitiesPicker({
  name,
  options,
  defaultSelected = [],
  label = "Ausstattung",
}: Props) {
  const initial = useMemo(() => new Set(defaultSelected), [defaultSelected]);
  const [sel, setSel] = useState<Set<string>>(initial);

  function toggle(v: string) {
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  }

  const arr = Array.from(sel);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={clsx(
              "rounded-full border px-3 py-1 text-sm",
              sel.has(opt)
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {/* hidden JSON payload */}
      <input type="hidden" name={name} value={JSON.stringify(arr)} />
    </div>
  );
}
