// app/(protected)/components/cancelMyBookingAction.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServerRead } from "@/lib/supabaseServer";
import type { Enums } from "@/types/supabase";

export async function cancelMyBookingAction(formData: FormData) {
  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string" || !bookingId) {
    throw new Error("Missing bookingId");
  }

  const supa = await supabaseServerRead();
  const { data: auth, error: authErr } = await supa.auth.getUser();
  if (authErr || !auth?.user) throw new Error("Not authenticated");
  const uid = auth.user.id;

  // Ownership prüfen
  const { data: b, error: readErr } = await supa
    .from("bookings")
    .select("id, athlete_user_id, status")
    .eq("id", bookingId)
    .single();
  if (readErr) throw new Error(readErr.message);
  if (b.athlete_user_id !== uid) throw new Error("Forbidden");

  // 1) Versuch über RPC (falls vorhanden)
  const { error: rpcErr } = await supa.rpc("cancel_booking", {
    p_booking: bookingId,
  });

  if (rpcErr) {
    // 2) Fallback: Status direkt setzen
    const { error: updErr } = await supa
      .from("bookings")
      .update({ status: "cancelled" as Enums<"booking_status"> })
      .eq("id", bookingId)
      .eq("athlete_user_id", uid);
    if (updErr) throw new Error(updErr.message);
  }

  // UI aktualisieren (Pfad ggf. anpassen)
  revalidatePath("/(protected)/dashboard");
}
