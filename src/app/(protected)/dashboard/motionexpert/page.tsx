import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  PlusCircle,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Für Typsicherheit ohne `any`
type Supa = Awaited<ReturnType<typeof supabaseServerRead>>;

export default async function MotionExpertOverviewPage() {
  const supa = await supabaseServerRead();

  // Session + Rolle prüfen
  const { data: me } = await supa.auth.getUser();
  const user = me?.user;
  if (!user) redirect("/login?redirectTo=/dashboard/motionexpert");

  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isMotionExpert =
    !!roles?.some((r) => r.role === "motionExpert") ||
    !!roles?.some((r) => r.role === "admin");

  if (!isMotionExpert) redirect("/dashboard");

  // Profil & Motion-Expert-Details
  const [{ data: profile }, mep, counts] = await Promise.all([
    supa
      .from("profiles")
      .select("name, alias")
      .eq("user_id", user.id)
      .maybeSingle(),
    getMotionExpertProfile(supa, user.id),
    getCountsSafe(supa, user.id),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-5xl font-semibold tracking-tight text-yuvi-skyblue font-fancy">
          {`Hey ${
            profile?.name || user.email?.split("@")[0] || "Pro"
          }!`.toUpperCase()}
        </h2>
        <p className="text-sm text-slate-600">{mep.stateLabel}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Action
          href="/dashboard/motionexpert/sessions/new"
          icon={<PlusCircle />}
          label="Neue Session"
        />
        <Action
          href="/dashboard/motionexpert/sessions"
          icon={<CalendarClock />}
          label="Sessions verwalten"
        />
        <Action
          href="/dashboard/motionexpert/bookings"
          icon={<ClipboardList />}
          label="Buchungen"
        />
        <Action
          href="/profile"
          icon={<Sparkles />}
          label="Profil vervollständigen"
        />
      </div>

      {/* Setup Hinweis */}
      {mep.needsAttention && (
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-amber-600">
              <AlertTriangle />
            </div>
            <div>
              <h3 className="font-semibold">Profil unvollständig</h3>
              <p className="mt-1 text-sm text-slate-600">
                Bitte ergänze {!mep.hasLicense && <b>deine Lizenz</b>}
                {!mep.hasLicense && !mep.hasSpecialties && " und "}
                {!mep.hasSpecialties && <b>deine Schwerpunkte</b>}, damit
                Athlet:innen dich finden und buchen können.
              </p>
              <div className="mt-3">
                <Link
                  href="/profile"
                  className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-black/90"
                >
                  Profil bearbeiten
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Kommende Sessions" value={counts.sessionsCount ?? "—"} />
        <Stat
          label="Offene Buchungen"
          value={counts.pendingBookingsCount ?? "—"}
        />
        <Stat label="Standorte (aktiv)" value={counts.locationsCount ?? "—"} />
      </div>
      {counts.errors.length > 0 && (
        <p className="text-xs text-slate-500">
          Hinweis: Diese Tabellen fehlen oder sind (noch) leer:{" "}
          {counts.errors.join(", ")}.
        </p>
      )}

      {/* Nächste Sessions */}
      <UpcomingSessions uid={user.id} />

      {(counts.sessionsCount ?? 0) === 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold">Noch keine kommenden Sessions</h3>
          <p className="mt-1 text-sm text-slate-600">
            Lege deine erste Session an, um loszulegen.
          </p>
          <div className="mt-3">
            <Link
              href="/dashboard/motionexpert/sessions/new"
              className="inline-block rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-black/90"
            >
              Neue Session erstellen
            </Link>
          </div>
        </div>
      )}

      {/* Offene Buchungen */}
      <PendingBookings uid={user.id} />
    </div>
  );
}

/* ---------- Helpers ---------- */

function Action({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm hover:bg-slate-50"
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

async function getMotionExpertProfile(
  supa: Supa,
  uid: string
): Promise<{
  hasLicense: boolean;
  hasSpecialties: boolean;
  needsAttention: boolean;
  stateLabel: string;
}> {
  try {
    // Fix: richtige Spalten
    const { data } = await supa
      .from("motion_expert_profiles")
      .select("licenses, training_focus")
      .eq("user_id", uid)
      .maybeSingle();

    const hasLicense =
      Array.isArray(data?.licenses) && data!.licenses!.length > 0;

    // "specialties" = training_focus in deinem Schema
    const hasSpecialties =
      Array.isArray(data?.training_focus) && data!.training_focus!.length > 0;

    const needsAttention = !hasLicense || !hasSpecialties;

    const stateLabel = needsAttention
      ? "Dein Profil ist noch unvollständig."
      : "Profil vollständig – bereit für Buchungen.";

    return { hasLicense, hasSpecialties, needsAttention, stateLabel };
  } catch {
    return {
      hasLicense: false,
      hasSpecialties: false,
      needsAttention: true,
      stateLabel: "Profildaten nicht verfügbar.",
    };
  }
}
async function getCountsSafe(
  supa: Supa,
  uid: string
): Promise<{
  locationsCount: number | null;
  sessionsCount: number | null;
  pendingBookingsCount: number | null;
  errors: string[];
}> {
  const errors: string[] = [];
  let locationsCount: number | null = null;
  let sessionsCount: number | null = null;
  let pendingBookingsCount: number | null = null;

  // A) Locations des Experts
  try {
    const { count, error } = await supa
      .from("studio_locations")
      .select("*", { count: "exact", head: true })
      .eq("host_user_id", uid);
    if (error) throw error;
    locationsCount = count ?? 0;
  } catch {
    errors.push("studio_locations");
  }

  // B) Alle Sessions des Experts (IDs holen)
  let sessionIds: string[] = [];
  try {
    const { data, error } = await supa
      .from("sessions")
      .select("id")
      .eq("expert_user_id", uid);
    if (error) throw error;
    sessionIds = (data ?? []).map((s) => s.id);
  } catch {
    errors.push("sessions");
  }

  // C) Kommende Occurrences für diese Sessions zählen
  try {
    if (sessionIds.length) {
      const { count, error } = await supa
        .from("session_occurrences")
        .select("*", { count: "exact", head: true })
        .in("session_id", sessionIds)
        .gte("starts_at", new Date().toISOString());
      if (error) throw error;
      sessionsCount = count ?? 0; // "kommende Sessions" = kommende Occurrences
    } else {
      sessionsCount = 0;
    }
  } catch {
    errors.push("session_occurrences");
  }

  // D) Offene Buchungen zählen (pending) für diese Occurrences
  try {
    if (sessionIds.length) {
      // erst Occurrence-IDs holen (ohne head, nur IDs)
      const { data: occList, error: occErr } = await supa
        .from("session_occurrences")
        .select("id")
        .in("session_id", sessionIds);
      if (occErr) throw occErr;
      const occIds = (occList ?? []).map((o) => o.id);

      if (occIds.length) {
        const { count, error } = await supa
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .in("occurrence_id", occIds)
          .eq("status", "pending"); // "requested" gibt es nicht in deinem Enum
        if (error) throw error;
        pendingBookingsCount = count ?? 0;
      } else {
        pendingBookingsCount = 0;
      }
    } else {
      pendingBookingsCount = 0;
    }
  } catch {
    errors.push("bookings");
  }

  return { locationsCount, sessionsCount, pendingBookingsCount, errors };
}

async function UpcomingSessions({ uid }: { uid: string }) {
  const supa = await supabaseServerRead();

  try {
    // Sessions des Experts inkl. Title/Dauer holen (Map bauen)
    const { data: sessions } = await supa
      .from("sessions")
      .select("id, title, duration_minutes")
      .eq("expert_user_id", uid);

    const titleBySession = new Map(
      (sessions ?? []).map((s) => [
        s.id,
        { title: s.title, dur: s.duration_minutes },
      ])
    );
    const sessionIds = (sessions ?? []).map((s) => s.id);

    if (!sessionIds.length) {
      return (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-600">Keine kommenden Sessions.</p>
        </div>
      );
    }

    // Nächste 5 Occurrences dieser Sessions
    const { data: occ } = await supa
      .from("session_occurrences")
      .select("id, session_id, starts_at, ends_at, capacity")
      .in("session_id", sessionIds)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(5);

    if (!occ || occ.length === 0) {
      return (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-600">Keine kommenden Sessions.</p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold">Nächste Sessions</h3>
        <ul className="mt-3 divide-y">
          {occ.map((o) => {
            const meta = titleBySession.get(o.session_id);
            const title = meta?.title ?? "Session";
            const dur = meta?.dur;
            return (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(o.starts_at).toLocaleString()}{" "}
                    {dur ? `• ${dur} min` : ""} • Kapazität {o.capacity}
                  </p>
                </div>
                <Link
                  className="text-sm rounded-md border px-3 py-1 hover:bg-slate-50"
                  href={`/dashboard/motionexpert/sessions/${o.session_id}`}
                >
                  Details
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  } catch {
    return (
      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-slate-600">
          Sessions-/Occurrences-Tabellen noch nicht verfügbar.
        </p>
      </div>
    );
  }
}

async function PendingBookings({ uid }: { uid: string }) {
  const supa = await supabaseServerRead();

  try {
    // Sessions des Experts -> Occurrences -> Bookings(pending)
    const { data: sessions } = await supa
      .from("sessions")
      .select("id, title")
      .eq("expert_user_id", uid);

    const sessionIds = (sessions ?? []).map((s) => s.id);
    const titleBySession = new Map(
      (sessions ?? []).map((s) => [s.id, s.title])
    );

    if (!sessionIds.length) {
      return (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-600">Keine offenen Buchungen.</p>
        </div>
      );
    }

    const { data: occ } = await supa
      .from("session_occurrences")
      .select("id, session_id, starts_at")
      .in("session_id", sessionIds);
    const occById = new Map((occ ?? []).map((o) => [o.id, o]));

    const occIds = (occ ?? []).map((o) => o.id);
    if (!occIds.length) {
      return (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-600">Keine offenen Buchungen.</p>
        </div>
      );
    }

    const { data: bookings } = await supa
      .from("bookings")
      .select("id, status, created_at, occurrence_id, athlete_user_id")
      .in("occurrence_id", occIds)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!bookings || bookings.length === 0) {
      return (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-600">Keine offenen Buchungen.</p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold">Offene Buchungen</h3>
        <ul className="mt-3 divide-y">
          {bookings.map((b) => {
            const occ = occById.get(b.occurrence_id);
            const title = occ
              ? titleBySession.get(occ.session_id) ?? "Session"
              : "Session";
            return (
              <li key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(b.created_at as string).toLocaleString()} •{" "}
                    {b.status}
                  </p>
                </div>
                <Link
                  className="text-sm rounded-md border px-3 py-1 hover:bg-slate-50"
                  href={`/dashboard/motionexpert/bookings/${b.id}`}
                >
                  Öffnen
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  } catch {
    return (
      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-slate-600">Bookings nicht verfügbar.</p>
      </div>
    );
  }
}
