import Link from "next/link";
import { headers } from "next/headers";
import crypto from "crypto";
import { supabaseServerAction, supabaseServerRead } from "@/lib/supabaseServer";
import { QR } from "./ui/QR";

function originFromHeaders(h: Headers) {
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

function genCode(): string {
  // 6-stellig, führende Nullen möglich
  return Math.floor(1e6 + Math.random() * 9e6)
    .toString()
    .slice(-6);
}

export default async function CheckinPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: occurrenceId } = await params;
  const sp = (await searchParams) ?? {};
  const refresh = sp.refresh === "1";

  const supaRead = await supabaseServerRead();
  const { data: me } = await supaRead.auth.getUser();
  if (!me?.user) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p>Bitte einloggen.</p>
      </div>
    );
  }

  // Occurrence + Session prüfen (Owner = Expert)
  const { data: occ } = await supaRead
    .from("session_occurrences")
    .select("id, session_id, sessions!inner(expert_user_id)")
    .eq("id", occurrenceId)
    .limit(1)
    .maybeSingle();

  const expertId =
    (occ as any)?.sessions?.expert_user_id ?? (occ as any)?.expert_user_id;

  if (!occ || expertId !== me.user.id) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <p>Keine Berechtigung für diese Occurrence.</p>
        <Link href="/dashboard/motionexpert/sessions" className="underline">
          Zurück
        </Link>
      </div>
    );
  }

  // Immer einen frischen Code pro Render (simpel & sicher)
  const code = genCode();
  const hash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const supa = await supabaseServerAction();

  // Token hinterlegen (für TTL/Audit)
  await supa.from("occurrence_checkin_tokens").insert({
    occurrence_id: occurrenceId,
    code_hash: hash,
    expires_at: expiresAt,
    created_by: me.user.id,
  });

  // Code in alle relevanten Bookings schreiben, damit RPC checken kann
  await supa
    .from("bookings")
    .update({ checkin_code: code })
    .eq("occurrence_id", occurrenceId)
    .in("status", ["pending", "confirmed"]);

  const base =
    process.env.NEXT_PUBLIC_APP_URL || originFromHeaders(await headers());
  const qrUrl = `${base}/dashboard/athlete/occ/${occurrenceId}/checkin?code=${code}`;

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Check-in QR</h1>
        <p className="text-sm text-slate-600">
          Zeig diesen Code deinen Teilnehmenden. Gültig bis{" "}
          {new Date(expiresAt).toLocaleTimeString()}.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border bg-white p-6">
        <QR value={qrUrl} />
        <div className="text-center">
          <p className="text-xs text-slate-500">Fallback-Code</p>
          <p className="text-2xl font-mono tracking-widest">{code}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`?refresh=1`}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Code neu erzeugen
          </Link>
          <a
            href={qrUrl}
            target="_blank"
            className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
          >
            Test-Check-in öffnen
          </a>
        </div>
      </div>

      <Link
        href="/dashboard/motionexpert/sessions"
        className="text-sm text-slate-600 underline"
      >
        Zurück zu meinen Sessions
      </Link>
    </div>
  );
}
