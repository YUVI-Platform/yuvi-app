"use server";

import { supabaseServerAction } from "@/lib/supabaseServer";

export async function openCheckinWindowAction(
  occurrenceId: string,
  ttlMinutes = 10,
  maxUses: number | null = null
) {
  const supa = await supabaseServerAction();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user) throw new Error("Nicht eingeloggt.");

  // Ownership absichern
  const { data: occ, error: occErr } = await supa
    .from("session_occurrences")
    .select("id, sessions!inner(expert_user_id)")
    .eq("id", occurrenceId)
    .maybeSingle();

  const expertId =
    (occ as any)?.sessions?.expert_user_id ?? (occ as any)?.expert_user_id;

  if (occErr || !occ || expertId !== me.user.id) {
    throw new Error("Keine Berechtigung für diese Occurrence.");
  }

  // Einmal-Token mit Ablaufzeit erzeugen
  const { data, error } = await supa.rpc("open_checkin_window", {
    p_occurrence: occurrenceId,
    p_ttl_minutes: ttlMinutes,
    p_max_uses: maxUses ?? undefined, // null -> undefined
  });
  if (error) throw new Error(error.message);

  // RPC gibt Array mit { token, expires_at } zurück
  return data?.[0] ?? null;
}
