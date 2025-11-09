// app/(protected)/components/CancelButton.tsx
"use client";

import { useActionState } from "react";
import {
  cancelMyBookingAction,
  type ActionState,
} from "./cancelMyBookingAction";

export default function CancelButton({
  bookingId,
  path,
}: {
  bookingId: string;
  path: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    cancelMyBookingAction,
    { ok: true }
  );

  return (
    <form action={formAction} className="inline-block">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="path" value={path} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
      >
        {pending ? "Storniere…" : "Session canceln"}
      </button>
      {state && "ok" in state && !state.ok && (
        <p className="mt-2 text-sm text-rose-600">{state.error}</p>
      )}
    </form>
  );
}
