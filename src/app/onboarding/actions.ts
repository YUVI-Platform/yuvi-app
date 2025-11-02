"use server";

import { redirect } from "next/navigation";
import { supabaseServerAction, supabaseServerRead } from "@/lib/supabaseServer";

export type OnboardingState = { ok: boolean; error?: string };

export async function saveProfile(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supaRead = await supabaseServerRead();
  const { data: auth } = await supaRead.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { ok: false, error: "Nicht eingeloggt." };

  const name = String(formData.get("name") || "").trim();
  const alias = String(formData.get("alias") || "").trim();
  const avatar_url = String(formData.get("avatar_url") || "").trim();

  if (!name || !alias)
    return { ok: false, error: "Bitte Name & Alias ausfüllen." };

  const supa = await supabaseServerAction();
  const { error: upErr } = await supa
    .from("profiles")
    .update({
      name,
      alias,
      ...(avatar_url ? { avatar_url } : {}),
      onboarding_done: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("user_id", uid);

  if (upErr) return { ok: false, error: upErr.message };

  // Rolle lesen → zielgerichteter Redirect (MVP-Heuristik)
  const { data: roles } = await supaRead
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);

  const role = roles?.[0]?.role ?? "athlete";
  const targetByRole: Record<string, string> = {
    athlete: "/dashboard",
    motionExpert: "/me/sessions/new", // ggf. auf /dashboard zeigen, wenn Route noch nicht existiert
    studioHost: "/me/locations/new",
    admin: "/admin/invites",
  };

  redirect(targetByRole[role] || "/dashboard");
}
