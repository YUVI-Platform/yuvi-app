// app/auth/signin/password/route.ts
import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function baseUrl(req: Request) {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/+$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

// Nur relative, lokale Pfade erlauben
function safePath(p: string | null): string | null {
  if (!p) return null;
  if (!p.startsWith("/") || p.startsWith("//")) return null;
  return p;
}

export async function GET(req: Request) {
  return NextResponse.redirect(new URL("/login", baseUrl(req)));
}

export async function POST(req: Request) {
  const supabase = await supabaseServerAction();
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const requested =
    safePath(String(form.get("redirectTo") ?? "")) || "/dashboard";

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  const base = baseUrl(req);
  if (error) {
    /* wie bei dir */
  }

  const { data: me } = await supabase.auth.getUser();
  const userId = me?.user?.id ?? "";

  // Rollen & Onboarding-Status laden
  const [{ data: roles }, { data: prof }] = await Promise.all([
    supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
    supabaseAdmin
      .from("profiles")
      .select("onboarding_done")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const isAdmin = !!roles?.some((r) => r.role === "admin");
  const needsOnboarding = !prof?.onboarding_done;

  // Ziel bestimmen
  let target = requested;
  if (needsOnboarding && !requested.startsWith("/admin")) {
    target = "/onboarding";
  }
  if (!isAdmin && requested.startsWith("/admin")) {
    target = needsOnboarding ? "/onboarding" : "/dashboard";
  }

  return NextResponse.redirect(new URL(target, base));
}
