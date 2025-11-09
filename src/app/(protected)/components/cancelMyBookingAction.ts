// app/(protected)/components/cancelMyBookingAction.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServerRead } from "@/lib/supabaseServer";
import type { Enums } from "@/types/supabase";

export type ActionState = { ok: true } | { ok: false; error: string };

export async function cancelMyBookingAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  try {
    const bookingId = String(formData.get("bookingId") || "");
    const path = String(formData.get("path") || "/(protected)/dashboard");
    if (!bookingId) return { ok: false, error: "Missing bookingId" };

    const supa = await supabaseServerRead();
    const { data: me } = await supa.auth.getUser();
    if (!me?.user) return { ok: false, error: "Not authenticated" };

    // Guard: nach Check-in kein Cancel
    const { data: existing, error: readErr } = await supa
      .from("bookings")
      .select("id, checked_in_at, payment, status")
      .eq("id", bookingId)
      .eq("athlete_user_id", me.user.id)
      .maybeSingle();

    if (readErr) return { ok: false, error: readErr.message };
    if (!existing) return { ok: false, error: "Booking not found" };

    if (existing.checked_in_at) {
      return {
        ok: false,
        error:
          "Stornieren nach Check-in ist nicht möglich. Bitte wende dich an den Support.",
      };
    }

    const { error } = await supa
      .from("bookings")
      .update({ status: "cancelled" as Enums<"booking_status"> })
      .eq("id", bookingId)
      .eq("athlete_user_id", me.user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath(path);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
