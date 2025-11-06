// app/(protected)/components/BookButton.tsx
import SubmitButton from "./SubmitButton";
import { bookOccurrenceAction } from "../dashboard/athlete/occ/[id]/actions";

export default function BookButton({ occurrenceId }: { occurrenceId: string }) {
  return (
    <form action={bookOccurrenceAction} className="inline-block">
      <input type="hidden" name="occurrenceId" value={occurrenceId} />
      <SubmitButton>Jetzt buchen</SubmitButton>
    </form>
  );
}
