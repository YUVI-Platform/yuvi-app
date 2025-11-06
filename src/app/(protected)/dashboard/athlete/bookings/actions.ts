// app/(protected)/dashboard/athlete/bookings/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServerAction } from "@/lib/supabaseServer";

export async function cancelBookingAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  if (!bookingId) return;

  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) {
    redirect("/login?redirectTo=/dashboard/athlete/bookings");
  }

  // Versuche zuerst per RPC (falls vorhanden), fallback: DELETE mit RLS
  let rpcError: string | null = null;
  try {
    const { error } = await supa.rpc("cancel_booking", {
      p_booking: bookingId,
    });
    if (error) rpcError = error.message;
  } catch (e: unknown) {
    if (e instanceof Error) {
      rpcError = e.message;
    } else {
      rpcError = String(e ?? "rpc failed");
    }
  }

  if (rpcError) {
    // Fallback: nur eigene Buchung löschen (RLS-Policy nötig)
    const { error: delErr } = await supa
      .from("bookings")
      .delete()
      .eq("id", bookingId)
      .eq("athlete_user_id", uid);

    if (delErr) {
      throw new Error(delErr.message);
    }
  }

  revalidatePath("/dashboard/athlete/bookings");
}
