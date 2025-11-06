// app/(protected)/components/SeatsLeftBadge.tsx
import { supabaseServerRead } from "@/lib/supabaseServer";

export default async function SeatsLeftBadge({
  occurrenceId,
}: {
  occurrenceId: string;
}) {
  const supa = await supabaseServerRead();
  const { data, error } = await supa.rpc("seats_left", {
    p_occurrence: occurrenceId,
    p_hold_minutes: 10,
  });

  const seats = typeof data === "number" ? data : null;

  if (error) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
        Plätze: —
      </span>
    );
  }

  const color =
    seats !== null && seats > 0
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${color}`}
    >
      {seats !== null ? `Plätze frei: ${seats}` : "Plätze: —"}
    </span>
  );
}
