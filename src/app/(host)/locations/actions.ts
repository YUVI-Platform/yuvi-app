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
  email: z.string().email().nullish(),
  expires_at: z.string().datetime().nullish(),
});
export type InviteInput = z.infer<typeof InviteSchema>;

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

  const h = await headers(); // <— wichtig
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const url = `${origin}/register?code=${code}`;

  revalidatePath("/admin/invites");
  return { code, url };
}

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

export async function deleteInvite(code: string) {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error("Forbidden");

  const { error } = await supabaseAdmin
    .from("invites")
    .delete()
    .eq("code", code);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/invites");
}
