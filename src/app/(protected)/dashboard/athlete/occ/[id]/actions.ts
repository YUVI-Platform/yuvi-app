"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServerAction } from "@/lib/supabaseServer";

export async function bookOccurrenceAction(occurrenceId: string) {
  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid)
    redirect(`/login?redirectTo=/dashboard/athlete/occ/${occurrenceId}`);

  const { data: bookingId, error } = await supa.rpc("book_occurrence", {
    p_occurrence: occurrenceId,
    p_hold_minutes: 10,
  });
  if (error) throw new Error(error.message);
  if (!bookingId) throw new Error("Keine Plätze verfügbar.");

  revalidatePath(`/dashboard/athlete`);
  revalidatePath(`/dashboard/athlete/occ/${occurrenceId}`);

  redirect(`/dashboard/athlete/bookings/${bookingId}`);
}

export async function cancelMyBookingAction(bookingId: string) {
  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user) redirect("/login?redirectTo=/dashboard/athlete");

  const { error } = await supa.rpc("cancel_booking", { p_booking: bookingId });
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/athlete`);
}
