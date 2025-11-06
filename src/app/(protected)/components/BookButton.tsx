"use client";

import { useFormStatus } from "react-dom";
import { bookOccurrenceAction } from "@/app/(protected)/dashboard/athlete/occ/[id]/actions";

export default function BookButton({ occurrenceId }: { occurrenceId: string }) {
  return (
    <form action={bookOccurrenceAction.bind(null, occurrenceId)}>
      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-black text-white py-3 font-medium"
    >
      {pending ? "Buchen…" : "Jetzt buchen"}
    </button>
  );
}
