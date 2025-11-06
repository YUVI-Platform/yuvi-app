// app/(protected)/components/CancelButton.tsx
import { cancelMyBookingAction } from "./cancelMyBookingAction";
import SubmitButton from "./SubmitButton"; // darf Client sein

export default function CancelButton({ bookingId }: { bookingId: string }) {
  return (
    <form action={cancelMyBookingAction} className="inline-block">
      <input type="hidden" name="bookingId" value={bookingId} />
      <SubmitButton className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-rose-600 text-white disabled:opacity-50">
        Buchung stornieren
      </SubmitButton>
    </form>
  );
}
