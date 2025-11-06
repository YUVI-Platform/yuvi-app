"use client";

import { useFormStatus } from "react-dom";
import { cancelMyBookingAction } from "@/app/(protected)/dashboard/athlete/occ/[id]/actions";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  return (
    <form action={cancelMyBookingAction.bind(null, bookingId)}>
      <Btn />
    </form>
  );
}

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl border border-rose-600 text-rose-600 py-3 font-medium"
    >
      {pending ? "Storniere…" : "Buchung stornieren"}
    </button>
  );
}
