// app/(protected)/components/bookOccurrenceAction.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServerRead } from "@/lib/supabaseServer";
import type { TablesInsert, Enums } from "@/types/supabase";

export async function bookOccurrenceAction(formData: FormData) {
  const occurrenceId = formData.get("occurrenceId");
  if (typeof occurrenceId !== "string" || !occurrenceId) {
    throw new Error("Missing occurrenceId");
  }

  const supa = await supabaseServerRead();
  const { data: userRes, error: authErr } = await supa.auth.getUser();
  if (authErr || !userRes?.user) {
    throw new Error("Not authenticated");
  }

  const newBooking: TablesInsert<"bookings"> = {
    occurrence_id: occurrenceId,
    athlete_user_id: userRes.user.id,
    status: "pending" satisfies Enums<"booking_status">,
    payment: "none" satisfies Enums<"payment_status">,
  };

  const { error } = await supa.from("bookings").insert(newBooking);
  if (error) throw new Error(error.message);

  // UI aktualisieren (Pfad ggf. anpassen)
  revalidatePath("/(protected)/dashboard");
}
