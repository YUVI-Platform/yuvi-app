// src/app/(protected)/dashboard/athlete/occ/[id]/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServerRead } from "@/lib/supabaseServer";
import type { TablesInsert, Enums } from "@/types/supabase";

export async function bookOccurrenceAction(formData: FormData) {
  const occurrenceId = formData.get("occurrenceId");
  if (typeof occurrenceId !== "string" || !occurrenceId) {
    throw new Error("Missing occurrenceId");
  }

  const supa = await supabaseServerRead();
  const { data: auth } = await supa.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) {
    redirect(`/login?redirectTo=/dashboard/athlete/occ/${occurrenceId}`);
  }

  // Optional: gegen-prüfen, ob noch Plätze frei sind
  const { data: seatsLeft, error: seatsErr } = await supa.rpc("seats_left", {
    p_occurrence: occurrenceId,
    p_hold_minutes: 10, // wenn deine seats_left das unterstützt
  });
  if (seatsErr) throw new Error(seatsErr.message);
  if (typeof seatsLeft === "number" && seatsLeft <= 0) {
    throw new Error("Keine Plätze mehr frei");
  }

  const newBooking: TablesInsert<"bookings"> = {
    occurrence_id: occurrenceId,
    athlete_user_id: uid!,
    status: "pending" as Enums<"booking_status">,
    payment: "none" as Enums<"payment_status">,
  };

  const { data: inserted, error } = await supa
    .from("bookings")
    .insert(newBooking)
    .select("id")
    .single();

  if (error) {
    // 23505 = unique_violation → "already booked"
    if ((error as any).code === "23505") {
      throw new Error("Du hast diese Session bereits gebucht.");
    }
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/athlete/occ/${occurrenceId}`);
  revalidatePath("/(protected)/dashboard");
  // redirect(`/dashboard/athlete/bookings/${inserted.id}`);
  redirect(`/dashboard/athlete/occ/${occurrenceId}`);
}
