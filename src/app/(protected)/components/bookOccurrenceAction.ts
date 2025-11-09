// app/(protected)/components/bookOccurrenceAction.ts
"use server";

import { supabaseServerAction } from "@/lib/supabaseServer";
import type { TablesInsert, Enums } from "@/types/supabase";

type ActionState =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

export async function bookOccurrenceAction(
  _prev: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  try {
    const occurrenceId = formData.get("occurrenceId");
    const path = formData.get("path");

    console.log("[bookOccurrenceAction] start", {
      occurrenceId,
      path,
      env: process.env.NODE_ENV,
    });

    if (typeof occurrenceId !== "string" || !occurrenceId) {
      console.warn("[bookOccurrenceAction] missing occurrenceId");
      return { ok: false, error: "Missing occurrenceId" };
    }

    const supa = await supabaseServerAction();
    const { data: userRes, error: authErr } = await supa.auth.getUser();

    if (authErr) {
      console.error("[bookOccurrenceAction] getUser error:", authErr);
    }
    console.log("[bookOccurrenceAction] user", userRes?.user?.id);

    if (!userRes?.user) {
      return { ok: false, error: "Not authenticated" };
    }

    // Doppelbuchung vermeiden
    const { data: existing, error: existingErr } = await supa
      .from("bookings")
      .select("id,status")
      .eq("occurrence_id", occurrenceId)
      .eq("athlete_user_id", userRes.user.id)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (existingErr) {
      console.error(
        "[bookOccurrenceAction] existing lookup error:",
        existingErr
      );
    } else {
      console.log("[bookOccurrenceAction] existing", existing ?? null);
    }

    if (existing?.id) {
      console.warn("[bookOccurrenceAction] already booked:", existing.id);
      return { ok: false, error: "Bereits gebucht." };
    }

    const newBooking: TablesInsert<"bookings"> = {
      occurrence_id: occurrenceId,
      athlete_user_id: userRes.user.id,
      status: "pending" satisfies Enums<"booking_status">,
      payment: "none" satisfies Enums<"payment_status">,
    };

    const { data, error } = await supa
      .from("bookings")
      .insert(newBooking)
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("[bookOccurrenceAction] insert error:", error);
      return { ok: false, error: error?.message ?? "Insert failed" };
    }

    console.log("[bookOccurrenceAction] success bookingId", data.id);

    // WICHTIG: kein revalidatePath hier – wir refreshen im Client nach dem Dialog
    return { ok: true, bookingId: data.id };
  } catch (e) {
    console.error("[bookOccurrenceAction] unhandled error:", e);
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "string"
        ? e
        : "Unknown error";
    return { ok: false, error: `Unhandled: ${msg}` };
  }
}
