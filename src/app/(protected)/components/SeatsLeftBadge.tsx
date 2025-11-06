import { supabaseServerRead } from "@/lib/supabaseServer";

export default async function SeatsLeftBadge({
  occurrenceId,
  small,
}: {
  occurrenceId: string;
  small?: boolean;
}) {
  const supa = await supabaseServerRead();
  const { data: left, error } = await supa.rpc("seats_left", {
    p_occurrence: occurrenceId,
    p_hold_minutes: 10,
  });

  const value = typeof left === "number" ? left : undefined;
  const label = value !== undefined ? `${value} frei` : "—";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 ${
        small ? "text-xs py-0.5" : "text-sm py-1"
      }`}
      aria-label={`Freie Plätze: ${value ?? "unbekannt"}`}
      title={`Freie Plätze`}
    >
      {label}
    </span>
  );
}
