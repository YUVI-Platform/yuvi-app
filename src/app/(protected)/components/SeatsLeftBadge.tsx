// src/app/(protected)/components/SeatsLeftBadge.tsx
import { supabaseServerRead } from "@/lib/supabaseServer";

/**
 * Zeigt Sitzkontingent für eine Occurrence:
 * - "X/Y belegt" (aus Capacity - seats_left)
 * - "N frei" (seats_left)
 *
 * seats_left() berücksichtigt p_hold_minutes (Reservationsfenster)
 */
export default async function SeatsLeftBadge({
  occurrenceId,
  holdMinutes = 15,
  showBoth = true, // true => "X/Y belegt • N frei", false => nur "N frei"
}: {
  occurrenceId: string;
  holdMinutes?: number;
  showBoth?: boolean;
}) {
  const supa = await supabaseServerRead();

  const [{ data: occ }, { data: left, error: leftErr }] = await Promise.all([
    supa
      .from("session_occurrences")
      .select("capacity")
      .eq("id", occurrenceId)
      .maybeSingle(),
    supa.rpc("seats_left", {
      p_occurrence: occurrenceId,
      p_hold_minutes: holdMinutes,
    }),
  ]);

  const capacity = occ?.capacity ?? 0;
  const seatsLeft =
    typeof left === "number" && !leftErr
      ? Math.max(0, left)
      : Math.max(0, capacity);
  const booked = Math.max(0, capacity - seatsLeft);

  // kleine Schutzkappen
  const safeCapacity = Math.max(capacity, booked);
  const pill =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1";

  return (
    <span className="inline-flex items-center gap-2">
      {showBoth && (
        <span className={`${pill} bg-slate-100 text-slate-700 ring-slate-200`}>
          {booked}/{safeCapacity} belegt
        </span>
      )}
      <span
        className={`${pill} ${
          seatsLeft > 0
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : "bg-rose-50 text-rose-700 ring-rose-200"
        }`}
      >
        {seatsLeft} frei
      </span>
    </span>
  );
}
