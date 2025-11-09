// src/app/(protected)/dashboard/studiohost/locations/[id]/edit/ui/DeleteWithConfirm.tsx
"use client";

import { useTransition } from "react";

type ServerAction = (fd: FormData) => Promise<unknown>;

export default function DeleteWithConfirm({
  id,
  action,
}: {
  id: string;
  action: ServerAction;
}) {
  const [pending, start] = useTransition();

  function onClick() {
    if (!confirm("Diese Location wirklich löschen?")) return;
    const fd = new FormData();
    fd.set("id", id);
    start(async () => {
      await action(fd);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
      aria-busy={pending}
    >
      {pending ? "Lösche…" : "Löschen"}
    </button>
  );
}
