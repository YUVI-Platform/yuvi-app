// src/app/(protected)/dashboard/motionexpert/bookings/page.tsx
import "server-only";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OccurrencePanel from "./OccurencePanel";

type Session = {
  id: string;
  title: string;
  price_cents: number;
  location_type: "self_hosted" | "studio_location";
  updated_at: string | null;
};

type Occurrence = {
  id: string;
  session_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
};

function euro(cents?: number) {
  if (typeof cents !== "number") return "—";
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export default async function Page() {
  const supa = await supabaseServerRead();
  const me = await supa.auth.getUser();
  if (!me.data.user) {
    redirect("/login?redirectTo=/dashboard/motionexpert/bookings");
  }

  // Sessions des aktuellen Motion Experts
  const { data: sessions } = await supa
    .from("sessions")
    .select("id, title, price_cents, location_type, updated_at")
    .eq("expert_user_id", me.data.user.id)
    .order("updated_at", { ascending: false });

  const sessionIds = (sessions ?? []).map((s) => s.id);
  let occs: Occurrence[] = [];
  if (sessionIds.length) {
    const { data: occurrences } = await supa
      .from("session_occurrences")
      .select("id, session_id, starts_at, ends_at, capacity")
      .in("session_id", sessionIds)
      .order("starts_at", { ascending: false });
    occs = occurrences ?? [];
  }

  // Gruppieren: Session -> Occurrences[]
  const groups = (sessions ?? []).map((s) => ({
    session: s as Session,
    occurrences: occs.filter((o) => o.session_id === s.id),
  }));

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bookings Übersicht</h1>
          <p className="text-sm text-slate-600">
            Alle Sessions mit Terminen. Zum Aufklappen klicken, um Buchungen zu
            verwalten.
          </p>
        </div>
        <Link
          href="/dashboard/motionexpert"
          className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:opacity-90"
        >
          Zurück zum Dashboard
        </Link>
      </div>

      {groups.length === 0 && (
        <Card className="p-4">
          <p className="text-sm text-slate-600">
            Du hast noch keine Sessions angelegt.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {groups.map(({ session, occurrences }) => (
          <Card key={session.id} className="p-4">
            {/* Session Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{session.title}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <Badge variant="secondary">
                    {session.location_type === "studio_location"
                      ? "Studio"
                      : "Self-Hosted"}
                  </Badge>
                  <span>{euro(session.price_cents)}</span>
                </div>
              </div>
              <Link
                href={`/dashboard/motionexpert/sessions/${session.id}`}
                className="text-sm underline underline-offset-2 hover:opacity-80"
              >
                Session bearbeiten
              </Link>
            </div>

            {/* Occurrences */}
            <div className="mt-4 divide-y">
              {occurrences.length === 0 && (
                <div className="py-3 text-sm text-slate-500">
                  Keine Termine für diese Session.
                </div>
              )}
              {occurrences.map((occ) => (
                <OccurrencePanel
                  key={occ.id}
                  occurrence={occ}
                  sessionTitle={session.title}
                  sessionPriceCents={session.price_cents}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
