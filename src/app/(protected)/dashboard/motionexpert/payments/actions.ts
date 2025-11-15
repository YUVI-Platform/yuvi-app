"use server";

import { z } from "zod";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { normalizePaypalLink } from "@/lib/payments/paypal";

const Schema = z.object({
  paypalLink: z.string().url().or(z.literal("")).optional(),
});

export async function savePaypalLink(prevState: any, formData: FormData) {
  const raw = (formData.get("paypalLink") as string) || "";
  const parsed = Schema.safeParse({ paypalLink: raw });
  if (!parsed.success) {
    return { ok: false, message: "Ungültiger Link." };
  }

  const cleaned = normalizePaypalLink(parsed.data.paypalLink || "");
  if (cleaned === "" && raw.trim() !== "") {
    return {
      ok: false,
      message:
        "Bitte einen gültigen PayPal-Link eingeben (paypal.me / paypal.link).",
    };
  }

  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) return { ok: false, message: "Nicht eingeloggt." };

  // Upsert in motion_expert_profiles pro user_id
  const { error } = await supa
    .from("motion_expert_profiles")
    .upsert(
      { user_id: uid, paypal_link: cleaned || null },
      { onConflict: "user_id" }
    );

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    message: cleaned ? "PayPal‑Link gespeichert." : "PayPal‑Link entfernt.",
  };
}
