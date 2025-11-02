import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const supabase = await supabaseServerAction(); // darf Cookies setzen
  const url = new URL(req.url);
  const code = url.searchParams.get("code"); // Auth-Code aus Query
  const next = url.searchParams.get("next") || "/admin/invites";

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${url.protocol}//${url.host}`
  ).replace(/\/+$/, "");

  return NextResponse.redirect(new URL(next, base));
}
