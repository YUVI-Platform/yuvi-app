// src/app/(protected)/components/SeatsLeftBadge.tsx
import { supabaseServerRead } from "@/lib/supabaseServer";
import clsx from "clsx";

/**
 * Zeigt Sitzkontingent für eine Occurrence:
 * - "X/Y belegt" (wenn Total-Kapazität bekannt)
 * - "N frei" (immer, via RPC/Fallback)
 */
export default async function SeatsLeftBadge({
  occurrenceId,
  holdMinutes = 15,
  showBoth = true,
}: {
  occurrenceId: string;
  holdMinutes?: number;
  showBoth?: boolean;
}) {
  const supa = await supabaseServerRead();

  // 1) Occurrence + mögliche Kapazitäten (Occurrence/Slot/Session)
  const [{ data: occ }, { data: rpcLeft, error: leftErr }] = await Promise.all([
    supa
      .from("session_occurrences")
      .select(
        `
        capacity, studio_slot_id, self_hosted_slot_id,
        sessions:session_id(max_participants),
        studio_slots:studio_slot_id(capacity),
        self_hosted_slots:self_hosted_slot_id(capacity)
      `
      )
      .eq("id", occurrenceId)
      .maybeSingle(),
    supa.rpc("seats_left", {
      p_occurrence: occurrenceId,
      p_hold_minutes: holdMinutes,
    }),
  ]);

  const isNum = (v: any): v is number =>
    typeof v === "number" && Number.isFinite(v);

  const occCap = isNum(occ?.capacity) ? occ!.capacity : null;
  const slotCap = isNum(occ?.studio_slots?.capacity)
    ? occ!.studio_slots!.capacity
    : isNum(occ?.self_hosted_slots?.capacity)
    ? occ!.self_hosted_slots!.capacity
    : null;
  const sessCap = isNum(occ?.sessions?.max_participants)
    ? occ!.sessions!.max_participants
    : null;

  const totalCap = occCap ?? slotCap ?? sessCap ?? null;

  // 2) Seats left
  let seatsLeft: number | null =
    isNum(rpcLeft) && !leftErr ? Math.max(0, Number(rpcLeft)) : null;

  // 3) Booked (nur wenn totalCap bekannt)
  let booked: number | null = null;

  if (seatsLeft === null) {
    // Fallback: wenn RPC nicht ging, zähle aktive Buchungen und rechne frei
    if (totalCap !== null) {
      const { data: bs } = await supa
        .from("bookings")
        .select("id")
        .eq("occurrence_id", occurrenceId)
        .neq("status", "cancelled");
      booked = bs?.length ?? 0;
      seatsLeft = Math.max(0, totalCap - booked);
    }
  } else {
    if (totalCap !== null) booked = Math.max(0, totalCap - seatsLeft);
  }

  const pill =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1";

  return (
    <span className="inline-flex items-center gap-2">
      {showBoth && totalCap !== null && booked !== null && (
        <span
          className={clsx(
            pill,
            booked < totalCap
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-rose-200"
          )}
        >
          {booked}/{totalCap} belegt
        </span>
      )}
    </span>
  );
}
