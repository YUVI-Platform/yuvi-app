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
    if (!me?.user?.id) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // RPC: reserviert Platz (pending) und gibt booking_id zurück
    const { data: bookingId, error } = await supa.rpc("book_occurrence", {
      p_occurrence: occurrenceId,
      p_hold_minutes: holdMinutes,
    });

    if (error) {
      // hübschere Fehlermeldungen
      const msg = error.message || "Buchung fehlgeschlagen";
      const normalized =
        msg.includes("uniq_booking") || msg.includes("duplicate key")
          ? "Du hast diese Session bereits gebucht."
          : msg.includes("no seats")
          ? "Keine Plätze mehr verfügbar."
          : msg;
      return NextResponse.json({ error: normalized }, { status: 409 });
    }

    return NextResponse.json({ bookingId }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unerwarteter Fehler" },
      { status: 500 }
    );
  }
}
