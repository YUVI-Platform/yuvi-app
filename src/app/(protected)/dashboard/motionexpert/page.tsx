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

type Role = "athlete" | "motionExpert" | "studioHost" | "admin";

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

  const emptyState = (counts.sessionsCount ?? 0) === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Willkommen {profile?.name || user.email?.split("@")[0] || "Pro"}
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
    const { data } = await supa
      .from("motion_expert_profiles")
      .select("license_id, specialties")
      .eq("user_id", uid)
      .maybeSingle();

    const hasLicense =
      !!data?.license_id && String(data.license_id).trim().length > 0;
    const hasSpecialties =
      Array.isArray(data?.specialties) && data!.specialties!.length > 0;

    const needsAttention = !hasLicense || !hasSpecialties;

    const stateLabel = needsAttention
      ? "Dein Profil ist noch unvollständig."
      : "Profil vollständig – bereit für Buchungen.";

    return { hasLicense, hasSpecialties, needsAttention, stateLabel };
  } catch {
    // Tabelle evtl. noch nicht angelegt
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

  // Locations, die dieser Expert hostet (optional – falls du diese Relation nutzt)
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

  // Kommende Sessions dieses Experts
  try {
    const { count, error } = await supa
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("host_user_id", uid)
      .gte("start_at", new Date().toISOString());
    if (error) throw error;
    sessionsCount = count ?? 0;
  } catch {
    errors.push("sessions");
  }

  // Offene Buchungen
  try {
    const { count, error } = await supa
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("host_user_id", uid)
      .in("status", ["pending", "requested"]);
    if (error) throw error;
    pendingBookingsCount = count ?? 0;
  } catch {
    errors.push("bookings");
  }

  return { locationsCount, sessionsCount, pendingBookingsCount, errors };
}

async function UpcomingSessions({ uid }: { uid: string }) {
  const supa = await supabaseServerRead();
  try {
    const { data } = await supa
      .from("sessions")
      .select("id, title, start_at, duration_min, location_name")
      .eq("host_user_id", uid)
      .gte("start_at", new Date().toISOString())
      .order("start_at", { ascending: true })
      .limit(5);

    if (!data || data.length === 0) {
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
          {data.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{s.title ?? "Session"}</p>
                <p className="text-xs text-slate-500">
                  {new Date(s.start_at as string).toLocaleString()} •{" "}
                  {s.duration_min ? `${s.duration_min} min` : "—"} •{" "}
                  {s.location_name ?? "—"}
                </p>
              </div>
              <Link
                className="text-sm rounded-md border px-3 py-1 hover:bg-slate-50"
                href={`/dashboard/motionexpert/sessions/${s.id}`}
              >
                Details
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch {
    return (
      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-slate-600">
          Sessions-Tabelle noch nicht verfügbar.
        </p>
      </div>
    );
  }
}

async function PendingBookings({ uid }: { uid: string }) {
  const supa = await supabaseServerRead();
  try {
    const { data } = await supa
      .from("bookings")
      .select("id, status, created_at, session_title, athlete_name")
      .eq("host_user_id", uid)
      .in("status", ["pending", "requested"])
      .order("created_at", { ascending: false })
      .limit(5);

    if (!data || data.length === 0) {
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
          {data.map((b) => (
            <li key={b.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{b.session_title ?? "Session"}</p>
                <p className="text-xs text-slate-500">
                  {b.athlete_name ?? "Athlet:in"} •{" "}
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
          ))}
        </ul>
      </div>
    );
  } catch {
    return (
      <div className="rounded-xl border bg-white p-5">
        <p className="text-sm text-slate-600">
          Bookings-Tabelle noch nicht verfügbar.
        </p>
      </div>
    );
  }
}
