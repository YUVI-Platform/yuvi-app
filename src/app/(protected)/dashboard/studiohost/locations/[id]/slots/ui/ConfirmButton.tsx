// src/app/(protected)/dashboard/studiohost/locations/[id]/slots/ui/ConfirmButton.tsx
"use client";
import { useState } from "react";

type ActionLike = (formData: FormData) => void | Promise<unknown>;

export default function ConfirmButton({
  label,
  confirmText,
  action, // Server Action (kann unknown zurückgeben)
  payload, // hidden inputs
}: {
  label: string;
  confirmText: string;
  action: ActionLike;
  payload: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="inline-flex">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md border px-3 py-1.5 text-sm"
        >
          {label}
        </button>
      ) : (
        // Wrapper sorgt dafür, dass das Form-Action-Signature `Promise<void>` ist
        <form
          action={async (fd: FormData) => {
            await action(fd);
          }}
        >
          {Object.entries(payload).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border px-3 py-1.5 text-sm"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white"
              aria-label={confirmText}
            >
              Bestätigen
            </button>
          </div>
          <p className="sr-only">{confirmText}</p>
        </form>
      )}
    </div>
  );
}
