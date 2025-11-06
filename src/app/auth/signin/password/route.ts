// app/auth/signin/password/route.ts
import { NextResponse } from "next/server";
import { supabaseServerAction, supabaseServerRead } from "@/lib/supabaseServer";

type Role = "athlete" | "motionExpert" | "studioHost" | "admin";
type UserRoleRow = { role: Role };

function baseUrl(req: Request) {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/+$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

// Nur lokale Pfade zulassen
function safePath(p: string | null): string | null {
  if (!p) return null;
  if (!p.startsWith("/") || p.startsWith("//")) return null;
  return p;
}

export async function GET(req: Request) {
  return NextResponse.redirect(new URL("/login", baseUrl(req)), 303);
}

export async function POST(req: Request) {
  const supaWrite = await supabaseServerAction();
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const requested =
    safePath(String(form.get("redirectTo") ?? "")) || "/dashboard";

  const { error } = await supaWrite.auth.signInWithPassword({
    email,
    password,
  });
  const base = baseUrl(req);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error.message
        )}&redirectTo=${encodeURIComponent(requested)}`,
        base
      ),
      303
    );
  }

  // Session lesen
  const { data: me } = await supaWrite.auth.getUser();
  const userId = me?.user?.id;
  if (!userId) {
    return NextResponse.redirect(new URL("/login", base), 303);
  }

  // RLS-Client (liest mit User-Session) => klare Filter!
  const supaRead = await supabaseServerRead();
  const [{ data: prof }, { data: roles }] = await Promise.all([
    supaRead
      .from("profiles")
      .select("onboarding_done")
      .eq("user_id", userId)
      .maybeSingle(),
    supaRead.from("user_roles").select("role").eq("user_id", userId),
  ]);

  // Rollen typisiert
  const roleRows: UserRoleRow[] = Array.isArray(roles)
    ? (roles as unknown as UserRoleRow[])
    : [];
  const roleList = roleRows.map((r) => r.role);
  const isAdmin = roleList.includes("admin");

  // "primäre" Rolle bestimmen (bevorzugt Nicht-Admin)
  const primaryRole: Role =
    roleList.find((r) => r !== "admin") ?? roleList[0] ?? "athlete";

  const needsOnboarding = prof ? !prof.onboarding_done : true;

  // role-basiertes Default-Ziel
  const defaultAfterLogin: Record<Role, string> = {
    athlete: "/dashboard/athlete/profile",
    motionExpert: "/dashboard/motionexpert/profile",
    studioHost: "/dashboard/studiohost/profile",
    admin: "/admin/invites",
  };

  let target = requested || "/dashboard";

  // 1) Onboarding erzwingen (außer Admin-Bereich)
  if (needsOnboarding && !target.startsWith("/admin")) {
    target = "/onboarding";
  }
  // 2) Kein Admin, aber Admin-Bereich angefragt
  else if (!isAdmin && target.startsWith("/admin")) {
    target = needsOnboarding
      ? "/onboarding"
      : defaultAfterLogin[primaryRole] || "/dashboard/profile";
  }
  // 3) Onboarding ist fertig, aber /onboarding angefragt -> auf Rollen-Default
  else if (!needsOnboarding && target.startsWith("/onboarding")) {
    target = defaultAfterLogin[primaryRole] || "/dashboard/profile";
  }
  // 4) Onboarding ist fertig und /dashboard (oder /) angefragt -> auf Rollen-Default
  else if (!needsOnboarding && (target === "/dashboard" || target === "/")) {
    target = defaultAfterLogin[primaryRole] || "/dashboard/profile";
  }

  return NextResponse.redirect(new URL(target, base), 303);
}
