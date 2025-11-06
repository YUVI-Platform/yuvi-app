// src/app/onboarding/actions.ts
"use server";

import { redirect } from "next/navigation";
import { supabaseServerAction, supabaseServerRead } from "@/lib/supabaseServer";

export type OnboardingState = { ok: boolean; error: string };

/**
 * Hilfen
 */
function sanitizeAlias(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-");
  return base.replace(/^-+|-+$/g, "");
}

function getAllStrings(fd: FormData, name: string): string[] {
  // Holt Mehrfachwerte (Checkboxen), akzeptiert zusätzlich Komma-getrennte Strings
  const many = fd.getAll(name);
  if (many.length > 1) {
    return many.map((v) => String(v).trim()).filter(Boolean);
  }
  const single = String(fd.get(name) ?? "").trim();
  if (!single) return [];
  if (single.includes(",")) {
    return single
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [single];
}

/**
 * Haupt-Action: Speichern & Fertig
 */
export async function saveAndFinishAction(formData: FormData): Promise<void> {
  const uid = String(formData.get("uid") || "");
  if (!uid) throw new Error("Missing uid");

  const supaRead = await supabaseServerRead();
  const { data: me } = await supaRead.auth.getUser();
  const email = me?.user?.email ?? "";
  if (!email) throw new Error("Kein E-Mail im Auth-User gefunden");

  // Allgemeine Profilfelder (nur vorhandene Columns)
  const name = String(formData.get("name") || "").trim();
  const aliasRaw = String(formData.get("alias") || "").trim();
  const avatar_url = String(formData.get("avatar_url") || "").trim();
  const aliasCandidate = sanitizeAlias(aliasRaw || email.split("@")[0] || "");

  const nowIso = new Date().toISOString();
  const supa = await supabaseServerAction();

  // 1) profiles upsert – immer Strings für non-null Felder, optional = undefined
  const safeName =
    name ||
    aliasCandidate ||
    (email.includes("@") ? email.split("@")[0] : "User");

  const basePayload = {
    user_id: uid, // string (required)
    name: safeName, // string (required, nie null)
    alias: aliasCandidate || undefined, // optional -> undefined statt null
    email, // string (required)
    avatar_url: avatar_url || undefined, // optional -> undefined statt null
    onboarding_done: true,
    onboarding_completed_at: nowIso,
    updated_at: nowIso,
  };

  let { error: upsertErr } = await supa
    .from("profiles")
    .upsert(basePayload, { onConflict: "user_id" });

  // 1b) Fallback bei Alias-Kollision (unique constraint)
  if (upsertErr && /profiles_.*alias.*key/i.test(upsertErr.message)) {
    const aliasFallback = (
      aliasCandidate ? `${aliasCandidate}-${uid.slice(0, 6)}` : uid.slice(0, 6)
    ).toLowerCase();

    const retry = await supa
      .from("profiles")
      .upsert(
        { ...basePayload, alias: aliasFallback },
        { onConflict: "user_id" }
      );

    upsertErr = retry.error ?? null;
  }
  if (upsertErr) throw new Error(upsertErr.message);

  // 2) Rollen-spezifische Daten speichern
  await saveByRole(formData, nowIso);

  // 3) Ziel
  redirect(await getRedirectPath(uid));
}

/**
 * Nur Zwischenspeichern (kein Redirect)
 */
export async function saveOnlyAction(formData: FormData): Promise<void> {
  const uid = String(formData.get("uid") || "");
  if (!uid) throw new Error("Missing uid");
  await saveByRole(formData, new Date().toISOString());
  redirect("/onboarding");
}

/**
 * Speichert pro Rolle ausschließlich Spalten aus DEINEN Tabellen.
 */
async function saveByRole(formData: FormData, nowIso: string): Promise<void> {
  const uid = String(formData.get("uid") || "");
  if (!uid) throw new Error("Missing uid");

  const supaRead = await supabaseServerRead();
  const { data: roles } = await supaRead
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);

  const role = roles?.map((r) => r.role).find((r) => r !== "admin");
  if (!role) throw new Error("Keine Rolle gesetzt");

  const supa = await supabaseServerAction();

  if (role === "athlete") {
    // athlete_profiles(user_id, fitness_level, about_me, created_at, updated_at)
    const fitness_level = String(formData.get("fitness_level") || "").trim();
    const about_me = String(formData.get("bio") || "").trim();

    const { error } = await supa.from("athlete_profiles").upsert(
      {
        user_id: uid,
        fitness_level: fitness_level || null,
        about_me: about_me || null,
        updated_at: nowIso,
      },
      { onConflict: "user_id" }
    );
    if (error) throw new Error(error.message);
    return;
  }

  if (role === "motionExpert") {
    // motion_expert_profiles(user_id, bio, licenses[], portfolio_image_urls[], training_focus[], rating_avg, rating_count, is_public, created_at, updated_at)
    // Form-Felder -> DB:
    // - "licenses": Checkbox/Text (optional). Falls du im UI "license_id" hast, wird es hier zu licenses[0] gemappt.
    const licenses = getAllStrings(formData, "licenses");
    const licenseId = String(formData.get("license_id") || "").trim();
    const finalLicenses = licenses.length
      ? licenses
      : licenseId
      ? [licenseId]
      : [];

    // specialties im UI → training_focus in DB
    const training_focus = getAllStrings(formData, "specialties").length
      ? getAllStrings(formData, "specialties")
      : getAllStrings(formData, "training_focus");

    // Portfolio-URLs – wir akzeptieren mehrere Feldnamen, speichern aber NUR in portfolio_image_urls
    const portfolio_image_urls = getAllStrings(formData, "portfolio_image_urls")
      .length
      ? getAllStrings(formData, "portfolio_image_urls")
      : getAllStrings(formData, "portfolio_urls");

    const bio = String(formData.get("bio") || "").trim();

    const { error } = await supa.from("motion_expert_profiles").upsert(
      {
        user_id: uid,
        bio: bio || null,
        licenses: finalLicenses.length ? finalLicenses : null,
        portfolio_image_urls: portfolio_image_urls.length
          ? portfolio_image_urls
          : null,
        training_focus: training_focus.length ? training_focus : null,
        // rating_* und is_public lässt du via Defaults/Separate Flows setzen
        updated_at: nowIso,
      },
      { onConflict: "user_id" }
    );
    if (error) throw new Error(error.message);
    return;
  }

  if (role === "studioHost") {
    // studio_host_profiles(user_id, company, phone, updated_at)
    // inside saveByRole() -> role === "studioHost"
    const company = String(formData.get("company") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    // company ist required(string) -> immer einen String schicken
    const safeCompany = company || "—"; // oder "Solo Host", was dir lieber ist

    const { error } = await supa.from("studio_host_profiles").upsert(
      {
        user_id: uid, // required string
        company: safeCompany, // <- nie null
        phone: phone || null, // optional (string | null erlaubt)
        updated_at: nowIso, // optional string
      },
      { onConflict: "user_id" }
    );

    if (error) throw new Error(error.message);
    return;
  }

  throw new Error("Unbekannte Rolle");
}

/**
 * Zielseite nach Onboarding
 */
async function getRedirectPath(uid: string): Promise<string> {
  const supa = await supabaseServerRead();
  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);

  const role =
    roles?.map((r) => r.role).find((r) => r !== "admin") ?? "athlete";
  const targetByRole: Record<string, string> = {
    athlete: "/dashboard/athlete/profile",
    motionExpert: "/dashboard/motionexpert/profile",
    studioHost: "/dashboard/studiohost/profile",
    admin: "/admin/invites",
  };
  return targetByRole[role] || "/login";
}
