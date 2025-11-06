"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServerAction } from "@/lib/supabaseServer";

export async function bookOccurrence(occurrenceId: string) {
  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) redirect("/login?redirectTo=/dashboard/athlete");

  // Simple insert; RLS muss Buchung erlauben
  const { error } = await supa
    .from("bookings")
    .insert({ user_id: uid, session_occurrence_id: occurrenceId });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/athlete");
}

export async function cancelBooking(bookingId: string) {
  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) redirect("/login?redirectTo=/dashboard/athlete");

  const { error } = await supa
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("user_id", uid);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/athlete");
}
