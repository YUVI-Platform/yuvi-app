// app/(protected)/components/bookOccurrenceAction.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServerAction } from "@/lib/supabaseServer";
import type { Enums } from "@/types/supabase";

export type ActionState =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

export async function bookOccurrenceAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const occurrenceId = String(formData.get("occurrenceId") || "");
  const path = String(formData.get("path") || "/(protected)/dashboard/athlete");

  if (!occurrenceId) return { ok: false, error: "Missing occurrenceId" };

  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user) return { ok: false, error: "Not authenticated" };

  // 1) Gibt's irgendeine Buchung für dieses Pair? (egal welcher Status)
  const { data: existing, error: exErr } = await supa
    .from("bookings")
    .select("id,status")
    .eq("occurrence_id", occurrenceId)
    .eq("athlete_user_id", me.user.id)
    .maybeSingle();

  if (exErr) return { ok: false, error: exErr.message };

  // 2) Wenn aktiv -> Abbrechen
  if (existing && ["pending", "confirmed"].includes(existing.status)) {
    return { ok: false, error: "already booked" };
  }

  // 3) Optional: Seats prüfen (falls du Überbuchung verhindern willst)
  //    -> nutzt deine DB-Funktion seats_left(p_hold_minutes, p_occurrence)
  const { data: seatsLeft, error: seatsErr } = await supa.rpc("seats_left", {
    p_occurrence: occurrenceId,
    p_hold_minutes: 15,
  });
  if (seatsErr) return { ok: false, error: seatsErr.message };
  if ((seatsLeft ?? 0) <= 0) {
    return { ok: false, error: "no seats left" };
  }

  // 4A) Reaktivieren einer stornierten/abgeschlossenen/no_show Buchung
  if (existing) {
    const { data: upd, error: updErr } = await supa
      .from("bookings")
      .update({
        status: "pending" as Enums<"booking_status">,
        payment: "none" as Enums<"payment_status">,
        checked_in_at: null,
        checkin_code: null,
      })
      .eq("id", existing.id)
      .select("id")
      .maybeSingle();

    if (updErr) return { ok: false, error: updErr.message };

    revalidatePath(path);
    return { ok: true, bookingId: upd!.id };
  }

  // 4B) Ersteintrag
  const { data: ins, error: insErr } = await supa
    .from("bookings")
    .insert({
      occurrence_id: occurrenceId,
      athlete_user_id: me.user.id,
      status: "pending" as Enums<"booking_status">,
      payment: "none" as Enums<"payment_status">,
    })
    .select("id")
    .maybeSingle();

  // Race-Condition-Guard: Falls parallel jemand reaktiviert/insertet -> trotzdem reaktivieren
  if (insErr?.code === "23505") {
    const { data: again } = await supa
      .from("bookings")
      .select("id,status")
      .eq("occurrence_id", occurrenceId)
      .eq("athlete_user_id", me.user.id)
      .maybeSingle();

    if (again && ["cancelled", "completed", "no_show"].includes(again.status)) {
      const { data: upd2, error: upd2Err } = await supa
        .from("bookings")
        .update({
          status: "pending" as Enums<"booking_status">,
          payment: "none" as Enums<"payment_status">,
          checked_in_at: null,
          checkin_code: null,
        })
        .eq("id", again.id)
        .select("id")
        .maybeSingle();
      if (upd2Err) return { ok: false, error: upd2Err.message };
      revalidatePath(path);
      return { ok: true, bookingId: upd2!.id };
    }

    // Wenn aktiv, sauber melden
    if (again && ["pending", "confirmed"].includes(again.status)) {
      return { ok: false, error: "already booked" };
    }

    // Sonst echten Fehler zurück
    return { ok: false, error: insErr.message };
  }

  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath(path);
  return { ok: true, bookingId: ins!.id };
}
