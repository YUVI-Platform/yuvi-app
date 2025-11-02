// app/auth/oauth/route.ts
import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";

function baseUrl(req: Request) {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/+$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

export async function GET(req: Request) {
  const supabase = await supabaseServerAction();
  const { searchParams } = new URL(req.url);
  const provider = (searchParams.get("provider") || "google") as "google";
  const next = searchParams.get("redirectTo") || "/admin/invites";

  const callback = `${baseUrl(req)}/auth/callback?next=${encodeURIComponent(
    next
  )}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback },
  });

  if (error || !data?.url) {
    const back = new URL("/login", baseUrl(req));
    back.searchParams.set("error", error?.message || "OAuth error");
    return NextResponse.redirect(back);
  }

  return NextResponse.redirect(data.url); // Google Consent
}
