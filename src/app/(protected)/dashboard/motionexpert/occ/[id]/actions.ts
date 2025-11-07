// app/(protected)/dashboard/motion-expert/occ/[id]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServerAction } from "@/lib/supabaseServer";

export async function checkinBookingAction(form: FormData) {
  const occurrenceId = form.get("occurrenceId") as string;
  const bookingId = form.get("bookingId") as string;
  const code = form.get("code") as string;

  const supa = await supabaseServerAction();

  // OPTIONAL: Zeitfenster-Check auf App-Seite (zusätzlich zu DB-Checks)
  // const { data: occ } = await supa
  //   .from("session_occurrences")
  //   .select("starts_at, ends_at")
  //   .eq("id", occurrenceId).maybeSingle();

  // DB-Funktion ausführen (RLS schützt, ob der Expert befugt ist)
  const { data, error } = await supa.rpc("checkin_booking", {
    p_occurrence: occurrenceId,
    p_booking: bookingId,
    p_code: code,
  });

  if (error) throw new Error(error.message);
  if (!data)
    throw new Error("Check-in fehlgeschlagen (Code/Zuordnung stimmt nicht).");

  revalidatePath(`/dashboard/motion-expert/occ/${occurrenceId}/checkin`);
}
