// app/(protected)/components/CancelBookingButton.tsx
import SubmitButton from "./SubmitButton";
import { cancelMyBookingAction } from "../dashboard/athlete/occ/[id]/actions";

export default function CancelBookingButton({
  occurrenceId,
}: {
  occurrenceId: string;
}) {
  return (
    <form action={cancelMyBookingAction} className="inline-block">
      <input type="hidden" name="occurrenceId" value={occurrenceId} />
      <SubmitButton className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-rose-600 text-white disabled:opacity-50">
        Buchung stornieren
      </SubmitButton>
    </form>
  );
}
