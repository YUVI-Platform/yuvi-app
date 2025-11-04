// src/app/dashboard/studiohost/page.tsx
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseServerRead } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  ClipboardList,
  PlusCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudioHostOverviewPage() {
  const supa = await supabaseServerRead();

  // Session + Rolle
  const { data: me } = await supa.auth.getUser();
  const user = me?.user;
  if (!user) redirect("/login?redirectTo=/dashboard/studiohost");

  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  const isStudioHost =
    !!roles?.some((r) => r.role === "studioHost") ||
    !!roles?.some((r) => r.role === "admin");
  if (!isStudioHost) redirect("/dashboard");

  // Profile + optional StudioHost company info
  const [{ data: profile }, { data: sh }] = await Promise.all([
    supa
      .from("profiles")
      .select("name, alias")
      .eq("user_id", user.id)
      .maybeSingle(),
    supa
      .from("studio_host_profiles")
      .select("company, phone")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  // Sanfte Counts (fehlende Tabellen werden abgefangen)
  const { locationsCount, sessionsCount, pendingBookingsCount, errors } =
    await getCountsSafe(supa, user.id);

  const emptyState = (locationsCount ?? 0) === 0 || (sessionsCount ?? 0) === 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Willkommen {profile?.name || user.email?.split("@")[0] || "Host"}
        </h2>
        <p className="text-sm text-slate-600">
          {sh?.company
            ? `Organisation: ${sh.company}`
            : "Hinterlege deine Firmeninfos im Onboarding/Profil."}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Action
          href="/dashboard/studiohost/locations/new"
          icon={<PlusCircle />}
          label="New Location"
        />
        <Action
          href="/dashboard/studiohost/sessions/new"
          icon={<PlusCircle />}
          label="New Session"
        />
        <Action
          href="/dashboard/studiohost/sessions"
          icon={<CalendarClock />}
          label="Manage Sessions"
        />
        <Action
          href="/dashboard/studiohost/bookings"
          icon={<ClipboardList />}
          label="View Bookings"
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat
          label="Locations"
          value={locationsCount ?? "—"}
          icon={<Building2 className="opacity-60" size={18} />}
        />
        <Stat
          label="Upcoming Sessions"
          value={sessionsCount ?? "—"}
          icon={<CalendarClock className="opacity-60" size={18} />}
        />
        <Stat
          label="Pending Bookings"
          value={pendingBookingsCount ?? "—"}
          icon={<ClipboardList className="opacity-60" size={18} />}
        />
      </div>

      {/* Setup Callouts */}
      {emptyState && (
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-amber-600">
              <AlertTriangle />
            </div>
            <div>
              <h3 className="font-semibold">Let’s get you set up</h3>
              <p className="text-sm text-slate-600 mt-1">
                Du hast noch keine Locations oder Sessions. Lege zuerst
                mindestens eine Location an und erstelle dann deine erste
                Session.
              </p>
              <div className="flex gap-2 mt-3">
                <Link
                  href="/dashboard/studiohost/locations/new"
                  className="rounded-md bg-black px-3 py-2 text-sm text-white"
                >
                  New Location
                </Link>
                <Link
                  href="/dashboard/studiohost/sessions/new"
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  New Session
                </Link>
              </div>
            </div>
          </div>
          {errors.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              Hinweis: Manche Tabellen scheinen noch zu fehlen (
              {errors.join(", ")}). Die KPIs blenden sich automatisch aus, bis
              du sie anlegst.
            </p>
          )}
        </div>
      )}

      {/* Optional: Nächste Sessions (max 5) */}
      <UpcomingSessions uid={user.id} />
    </div>
  );
}

/* ---- helpers ---- */

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

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

async function getCountsSafe(supa: SupabaseClient, uid: string) {
  const errors: string[] = [];
  let locationsCount: number | null = null;
  let sessionsCount: number | null = null;
  let pendingBookingsCount: number | null = null;

  try {
    const { count, error } = await supa
      .from("studio_locations")
      .select("*", { count: "exact", head: true })
      .eq("owner_user_id", uid);
    if (error) throw error;
    locationsCount = count ?? 0;
  } catch {
    errors.push("studio_locations");
  }

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
            <li key={s.id} className="py-3 flex items-center justify-between">
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
                href={`/dashboard/studiohost/sessions/${s.id}`}
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
