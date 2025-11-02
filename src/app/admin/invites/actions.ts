"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/requireAdmin";

const InviteSchema = z.object({
  role: z.enum(["athlete", "motionExpert", "studioHost"]),
  max_uses: z.coerce.number().int().positive().default(1),
  // optional: auf bestimmte Mail einschränken (kannst du im UI ergänzen)
  email: z.string().email().nullish(),
  // ISO-String oder null
  expires_at: z.string().datetime().nullish(),
});
export type InviteInput = z.infer<typeof InviteSchema>;

/**
 * Create a new invite code (admin only).
 * Returns { code, url } – URL nutzt NEXT_PUBLIC_APP_URL oder Host-Header.
 */
export async function createInvite(input: InviteInput) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Forbidden");

  const parsed = InviteSchema.parse(input);
  const code = randomBytes(8).toString("hex");

  const { error } = await supabaseAdmin.from("invites").insert({
    code,
    role: parsed.role,
    email: parsed.email ?? null,
    max_uses: parsed.max_uses,
    expires_at: parsed.expires_at ?? null,
    is_active: true,
    created_by: gate.user!.id,
  });

  if (error) throw new Error(error.message);

  const h = headers();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const url = `${origin}/register?code=${code}`;

  revalidatePath("/admin/invites");
  return { code, url };
}

/** List all invites (admin only). */
export async function listInvites() {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Forbidden");

  const { data, error } = await supabaseAdmin
    .from("invites")
    .select(
      "code, role, email, max_uses, used_count, is_active, expires_at, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Activate/Deactivate an invite by code (admin only). */
export async function toggleInvite(code: string, active: boolean) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Forbidden");

  const { error } = await supabaseAdmin
    .from("invites")
    .update({ is_active: active })
    .eq("code", code);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/invites");
}

/** Delete an invite by code (admin only). */
export async function deleteInvite(code: string) {
  const gate = await requireAdmin({ devBypass: true });
  if (!gate.ok) throw new Error("Forbidden");

  const { error } = await supabaseAdmin
    .from("invites")
    .delete()
    .eq("code", code);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/invites");
}
