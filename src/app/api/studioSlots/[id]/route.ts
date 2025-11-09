// src/app/api/studioSlots/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServerRead } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const SLOT_COLS = "id, starts_at, ends_at, status, capacity, allowed_tags";

async function fetchSlotsByAnyColumn(
  supa: Awaited<ReturnType<typeof supabaseServerRead>>,
  id: string,
  from: string,
  to: string,
  onlyFree: boolean
) {
  // Falls deine Column anders heißt, probieren wir mehrere Varianten
  const candidates = ["location_id", "studio_location_id", "studio_id"];

  let last42703: any = null;
  for (const col of candidates) {
    const q = supa
      .from("studio_slots")
      .select(SLOT_COLS)
      .eq(col, id)
      .gte("starts_at", from)
      .lt("starts_at", to)
      .order("starts_at", { ascending: true });

    const { data, error } = await (onlyFree ? q.eq("status", "available") : q);

    if (!error) {
      return { data: data ?? [], usedColumn: col as string };
    }
    // 42703 = column does not exist -> nächsten Kandidaten probieren
    if ((error as any).code === "42703") {
      last42703 = error;
      continue;
    }
    // anderer Fehler -> sofort raus
    return { error };
  }
  return {
    error: last42703 ?? new Error("No matching column for location filter"),
  };
}

export async function GET(req: NextRequest, ctx: any) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const onlyFree = searchParams.get("onlyFree") !== "0"; // default: true

    const locationId = ctx?.params?.id as string | undefined;
    if (!locationId) {
      return NextResponse.json(
        { error: "Missing route param :id" },
        { status: 400 }
      );
    }
    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing query params: from, to" },
        { status: 400 }
      );
    }

    const supa = await supabaseServerRead();

    // 1) Slots für die Location holen (mit Spalten-Fallback)
    const res = await fetchSlotsByAnyColumn(
      supa,
      locationId,
      from,
      to,
      onlyFree
    );
    if ("error" in res && res.error) throw res.error;

    // Debug: welche Spalte hat gegriffen
    console.log("[api/studioSlots] used column:", res.usedColumn);

    // 2) Normalisieren & nur valide IDs
    const normalized = (Array.isArray(res.data) ? res.data : [])
      .filter((s: any) => typeof s?.id === "string" && s.id.length > 0)
      .map((s: any) => ({
        id: s.id as string,
        starts_at: s.starts_at as string,
        ends_at: s.ends_at as string,
        status: (s.status ?? "available") as string,
        capacity: s.capacity ?? null,
        allowed_tags: Array.isArray(s.allowed_tags) ? s.allowed_tags : null,
      }));

    if (!normalized.length) {
      return NextResponse.json({ slots: [] });
    }

    let out = normalized;

    // 3) Nur freie Slots zurückgeben (keine verknüpften Occurrences, keine blockierten Stati)
    if (onlyFree) {
      const ids = out
        .map((s) => s.id)
        .filter((x): x is string => typeof x === "string" && x.length > 0);

      if (!ids.length) return NextResponse.json({ slots: [] });

      const { data: occ, error: eOcc } = await supa
        .from("session_occurrences")
        .select("studio_slot_id")
        .in("studio_slot_id", ids);

      if (eOcc) throw eOcc;

      const taken = new Set((occ ?? []).map((o) => o.studio_slot_id));
      out = out.filter((s) => {
        const st = String(s.status).toLowerCase().trim();
        const blocked =
          st === "blocked" ||
          st === "archived" ||
          st === "booked" ||
          st === "held";
        return !taken.has(s.id) && !blocked;
      });
    }

    return NextResponse.json({ slots: out });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
