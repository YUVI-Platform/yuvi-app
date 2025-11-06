import { NextResponse } from "next/server";
import { supabaseServerRead } from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params; // Next 15: params as Promise
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!id) {
    return NextResponse.json({ error: "missing location id" }, { status: 400 });
  }

  const supa = await supabaseServerRead();

  // Filter: nur zukünftige & „available“
  const q = supa
    .from("studio_slots")
    .select("id, starts_at, ends_at, capacity, status, allowed_tags")
    .eq("location_id", id)
    .neq("status", "blocked")
    .order("starts_at", { ascending: true });

  if (from) q.gte("starts_at", from);
  if (to) q.lte("starts_at", to);

  const { data, error } = await q;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optional stricter: nur „available“
  const slots = (data ?? []).filter((s) => s.status === "available");

  return NextResponse.json({ slots });
}
