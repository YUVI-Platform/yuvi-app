"use server";

import { redirect } from "next/navigation";
import { supabaseServerAction, supabaseServerRead } from "@/lib/supabaseServer";

export type OnboardingState = { ok: boolean; error?: string };

// Haupt-Speicher-Action für "Speichern & Fertig"
export async function saveAndFinishAction(formData: FormData) {
  const uid = String(formData.get("uid") || "");
  if (!uid) throw new Error("Missing uid");

  // Name, Alias, Avatar auch speichern
  const name = String(formData.get("name") || "").trim();
  const alias = String(formData.get("alias") || "").trim();
  const avatar_url = String(formData.get("avatar_url") || "").trim();

  const supa = await supabaseServerAction();

  // ✅ Allgemeine Profildaten aktualisieren
  await supa
    .from("profiles")
    .update({
      ...(name ? { name } : {}),
      ...(alias ? { alias } : {}),
      ...(avatar_url ? { avatar_url } : {}),
      onboarding_done: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("user_id", uid);

  // ✅ Rolle-spezifische Daten speichern
  await saveByRole(formData);

  // ✅ Redirect je nach Rolle
  redirect(await getRedirectPath(uid));
}

// Nur Zwischenspeichern (kein Redirect)
export async function saveOnlyAction(formData: FormData) {
  await saveByRole(formData);
  redirect("/onboarding");
}

// Rolle-spezifisches Speichern
async function saveByRole(formData: FormData) {
  const uid = String(formData.get("uid") || "");
  if (!uid) throw new Error("Missing uid");

  const supaR = await supabaseServerRead();
  const { data: roles } = await supaR
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);

  const role = roles?.map((r) => r.role).find((r) => r !== "admin");
  if (!role) throw new Error("Keine Rolle gesetzt");

  const supa = await supabaseServerAction();

  if (role === "athlete") {
    const fitness_level = String(formData.get("fitness_level") || "");
    const bio = String(formData.get("bio") || "");

    await supa.from("athlete_profiles").upsert({
      user_id: uid,
      fitness_level,
      bio,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  if (role === "motionExpert") {
    const license_id = String(formData.get("license_id") || "");
    const specialtiesRaw = String(formData.get("specialties") || "");
    const portfolio_url = String(formData.get("portfolio_url") || "");

    const specialties = specialtiesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await supa.from("motion_expert_profiles").upsert({
      user_id: uid,
      license_id,
      specialties,
      portfolio_url: portfolio_url || null,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  if (role === "studioHost") {
    const company = String(formData.get("company") || "");
    const phone = String(formData.get("phone") || "");

    await supa.from("studio_host_profiles").upsert({
      user_id: uid,
      company,
      phone,
      updated_at: new Date().toISOString(),
    });
    return;
  }

  throw new Error("Unbekannte Rolle");
}

// Zielseite nach erfolgreichem Onboarding
async function getRedirectPath(uid: string): Promise<string> {
  const supa = await supabaseServerRead();
  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);

  const role = roles?.[0]?.role ?? "athlete";
  const targetByRole: Record<string, string> = {
    athlete: "/dashboard/profile",
    motionExpert: "/dashboard/profile",
    studioHost: "/dashboard/profile",
    admin: "/admin/invites",
  };

  return targetByRole[role] || "/dashboard";
}
