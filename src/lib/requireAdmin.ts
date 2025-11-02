import { supabaseServerRead } from "./supabaseServer";

export async function requireAdmin(opts?: { devBypass?: boolean }) {
  const supabase = await supabaseServerRead();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };

  const devBypass =
    opts?.devBypass &&
    process.env.NODE_ENV !== "production" &&
    process.env.ADMIN_BYPASS === "1";

  if (devBypass) return { ok: true as const, user, bypass: true as const };

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isAdmin = !!roles?.some((r) => r.role === "admin");
  return isAdmin ? { ok: true as const, user } : { ok: false as const };
}
