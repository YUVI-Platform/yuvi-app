// app/(public)/register/actions.ts
"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Role = "athlete" | "motionExpert" | "studioHost";

export async function validateInvite(code: string) {
  const { data, error } = await supabaseAdmin
    .from("invites")
    .select("code, role, is_active, max_uses, used_count, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) return { ok: false as const };

  const expired = data.expires_at && new Date(data.expires_at) < new Date();
  const usable =
    data.is_active && !expired && (data.used_count ?? 0) < data.max_uses;

  return usable
    ? { ok: true as const, role: data.role as Role }
    : { ok: false as const };
}

export async function finalizeInviteAtomic(args: {
  code: string;
  user_id: string;
  email: string;
}) {
  const { data, error } = await supabaseAdmin.rpc("claim_invite", {
    p_code: args.code,
    p_user: args.user_id,
    p_email: args.email,
  });

  if (error || !data?.[0]?.ok) {
    throw new Error(error?.message || "Invite konnte nicht eingelöst werden");
  }

  return {
    ok: true as const,
    role: data[0].invite_role as Role,
  };
}
