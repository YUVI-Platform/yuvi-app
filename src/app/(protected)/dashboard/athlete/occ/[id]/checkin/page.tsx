import Link from "next/link";
import crypto from "crypto";
import { supabaseServerAction, supabaseServerRead } from "@/lib/supabaseServer";

export default async function AthleteCheckinPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: occurrenceId } = await params;
  const sp = (await searchParams) ?? {};
  const code = typeof sp.code === "string" ? sp.code.trim() : "";

  const supaRead = await supabaseServerRead();
  const { data: me } = await supaRead.auth.getUser();
  if (!me?.user) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p>Bitte einloggen.</p>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="mx-auto max-w-lg p-6 space-y-2">
        <p className="font-medium">Kein Code übergeben.</p>
        <p className="text-sm text-slate-600">
          Bitte scanne den QR-Code des Trainers/der Trainerin.
        </p>
      </div>
    );
  }

  // eigenes Booking zur Occurrence finden
  const { data: booking } = await supaRead
    .from("bookings")
    .select("id,status")
    .eq("occurrence_id", occurrenceId)
    .eq("athlete_user_id", me.user.id)
    .in("status", ["pending", "confirmed"])
    .limit(1)
    .maybeSingle();

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg p-6 space-y-2">
        <p className="font-medium">Keine passende Buchung gefunden.</p>
        <p className="text-sm text-slate-600">
          Du brauchst eine aktive Buchung für diese Session.
        </p>
      </div>
    );
  }

  // Token noch gültig?
  const hash = crypto.createHash("sha256").update(code).digest("hex");
  const { data: token } = await supaRead
    .from("occurrence_checkin_tokens")
    .select("id")
    .eq("occurrence_id", occurrenceId)
    .eq("code_hash", hash)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (!token) {
    return (
      <div className="mx-auto max-w-lg p-6 space-y-2">
        <p className="font-medium">Code abgelaufen oder ungültig.</p>
        <p className="text-sm text-slate-600">
          Bitte den Trainer/die Trainerin um einen neuen QR-Code.
        </p>
      </div>
    );
  }

  // eigentlicher Check-in via RPC
  const supa = await supabaseServerAction();
  const { error } = await supa.rpc("checkin_booking", {
    p_booking: booking.id,
    p_code: code,
  });

  if (error) {
    return (
      <div className="mx-auto max-w-lg p-6 space-y-2">
        <p className="font-medium">Check-in fehlgeschlagen.</p>
        <p className="text-sm text-slate-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Check-in erfolgreich ✅</h1>
      <p className="text-sm text-slate-600">Viel Spaß bei deiner Session!</p>
      <Link
        href="/dashboard/athlete/bookings"
        className="text-sm underline text-slate-700"
      >
        Zu meinen Buchungen
      </Link>
    </div>
  );
}
