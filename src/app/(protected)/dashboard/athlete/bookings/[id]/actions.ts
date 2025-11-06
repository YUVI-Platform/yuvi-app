// app/(protected)/dashboard/athlete/occ/[id]/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServerAction } from "@/lib/supabaseServer";

export async function bookOccurrenceAction(formData: FormData) {
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  if (!occurrenceId) throw new Error("Occurrence-ID fehlt.");

  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) redirect("/login?redirectTo=/dashboard/athlete");

  // Try RPC (function lives in DB). Types may not know it yet → cast.
  const { data, error } = await supa.rpc("book_occurrence" as any, {
    p_occurrence: occurrenceId,
    p_hold_minutes: 10,
    p_athlete: uid, // falls deine Funktion den optionalen Parameter unterstützt
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/athlete/occ/${occurrenceId}`);
  revalidatePath(`/dashboard/athlete/bookings`);
  redirect(`/dashboard/athlete/bookings`);
}

export async function cancelMyBookingAction(formData: FormData) {
  const occurrenceId = String(formData.get("occurrenceId") ?? "");
  if (!occurrenceId) throw new Error("Occurrence-ID fehlt.");

  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) redirect("/login?redirectTo=/dashboard/athlete");

  // Wenn du eine cancel_booking(p_booking uuid) Funktion hast, bräuchten wir bookingId.
  // Einfacher: delete by occurrence + athlete.
  const { error } = await supa
    .from("bookings")
    .delete()
    .eq("occurrence_id", occurrenceId)
    .eq("athlete_user_id", uid);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/athlete/occ/${occurrenceId}`);
  revalidatePath(`/dashboard/athlete/bookings`);
}
