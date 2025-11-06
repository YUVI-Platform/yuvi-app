// src/app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { occurrenceId, holdMinutes = 15 } = await req.json();

    if (!occurrenceId) {
      return NextResponse.json(
        { error: "occurrenceId fehlt" },
        { status: 400 }
      );
    }

    const supa = await supabaseServerAction();
    const { data: me } = await supa.auth.getUser();
    const uid = me?.user?.id;
    if (!uid)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    // 1) Seats prüfen
    const { data: seats, error: seatsErr } = await supa.rpc("seats_left", {
      p_occurrence: occurrenceId,
      p_hold_minutes: holdMinutes,
    });
    if (safely(seatsErr)) throw seatsErr;
    if (!seats || seats <= 0) {
      return NextResponse.json(
        { error: "Keine Plätze mehr verfügbar." },
        { status: 409 }
      );
    }

    // 2) Optional: Duplicate verhindern
    const { data: dup } = await supa
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("occurrence_id", occurrenceId)
      .eq("athlete_user_id", uid)
      .in("status", ["pending", "confirmed"]);
    if ((dup as any)?.count > 0) {
      return NextResponse.json(
        { error: "Du hast diese Session bereits gebucht." },
        { status: 409 }
      );
    }

    // 3) Insert (Hold)
    const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    const { data: ins, error: insErr } = await supa
      .from("bookings")
      .insert({
        occurrence_id: occurrenceId,
        athlete_user_id: uid,
        status: "pending",
        payment: "reserved",
        checkin_code: code,
      })
      .select("id")
      .maybeSingle();

    if (insErr) {
      const msg = insErr.message || "Buchung fehlgeschlagen";
      const normalized =
        msg.includes("uniq_booking") || msg.includes("duplicate key")
          ? "Du hast diese Session bereits gebucht."
          : msg;
      return NextResponse.json({ error: normalized }, { status: 409 });
    }

    return NextResponse.json({ bookingId: ins?.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unerwarteter Fehler" },
      { status: 500 }
    );
  }
}

function safely(e: unknown): e is Error {
  return !!e;
}
