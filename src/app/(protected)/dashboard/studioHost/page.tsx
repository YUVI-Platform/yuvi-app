// src/app/dashboard/studiohost/page.tsx
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseServerRead } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Building2,
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
  const { locationsCount, pendingBookingsCount, errors } = await getCountsSafe(
    supa,
    user.id
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-5xl font-semibold tracking-tight font-fancy text-yuvi-skyblue">
          {(profile?.name || user.email?.split("@")[0] || "Host").toUpperCase()}
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
          href="/dashboard/studiohost/locations"
          icon={<Building2 />}
          label="Manage Locations"
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
          icon={
            <Building2 className="opacity-60 text-yuvi-skyblue" size={18} />
          }
        />

        <Stat
          label="Pending Bookings"
          value={pendingBookingsCount ?? "—"}
          icon={
            <ClipboardList className="opacity-60 text-yuvi-skyblue" size={18} />
          }
        />
      </div>

      {/* Setup Callouts */}
      {!locationsCount && (
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
      className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm hover:bg-yuvi-skyblue hover:text-white transition"
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
        <p className="text-sm">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-5xl font-semibold font-fancy text-yuvi-skyblue">
        {value}
      </p>
    </div>
  );
}

async function getCountsSafe(supa: SupabaseClient, uid: string) {
  const errors: string[] = [];
  let locationsCount: number | null = null;
  let sessionsCount: number | null = null;
  let pendingBookingsCount: number | null = null;

  // A) Locations (du bist Owner ODER Host)
  let locationIds: string[] = [];
  try {
    const { data, error, count } = await supa
      .from("studio_locations")
      .select("id", { count: "exact" })
      .or(`owner_user_id.eq.${uid},host_user_id.eq.${uid}`);
    if (error) throw error;
    locationsCount = count ?? 0;
    locationIds = (data ?? []).map((l) => l.id);
  } catch {
    errors.push("studio_locations");
    locationsCount = null;
  }

  // B) Slots für diese Locations
  let slotIds: string[] = [];
  try {
    if (locationIds.length) {
      const { data, error } = await supa
        .from("studio_slots")
        .select("id, location_id")
        .in("location_id", locationIds);
      if (error) throw error;
      slotIds = (data ?? []).map((s) => s.id);
    } else {
      slotIds = [];
    }
  } catch {
    errors.push("studio_slots");
    slotIds = [];
  }

  // C) Kommende Occurrences, die an deinen Slots hängen
  try {
    if (slotIds.length) {
      const { count, error } = await supa
        .from("session_occurrences")
        .select("*", { count: "exact", head: true })
        .in("studio_slot_id", slotIds)
        .gte("starts_at", new Date().toISOString());
      if (error) throw error;
      sessionsCount = count ?? 0; // „Upcoming Sessions“ = Anzahl Occurrences
    } else {
      sessionsCount = 0;
    }
  } catch {
    errors.push("session_occurrences");
    sessionsCount = null;
  }

  // D) Pending Bookings für diese Occurrences
  try {
    if (slotIds.length) {
      const { data: occData, error: occErr } = await supa
        .from("session_occurrences")
        .select("id")
        .in("studio_slot_id", slotIds);
      if (occErr) throw occErr;

      const occIds = (occData ?? []).map((o) => o.id);
      if (occIds.length) {
        const { count, error } = await supa
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .in("occurrence_id", occIds)
          .eq("status", "pending"); // „requested“ gibt's in deinem Enum nicht
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
    pendingBookingsCount = null;
  }

  return { locationsCount, sessionsCount, pendingBookingsCount, errors };
}

async function UpcomingSessions({ uid }: { uid: string }) {
  const supa = await supabaseServerRead();

  try {
    // 1) Deine Locations (Owner ODER Host) → Map für Titel
    const { data: locs } = await supa
      .from("studio_locations")
      .select("id, title")
      .or(`owner_user_id.eq.${uid},host_user_id.eq.${uid}`);

    const locationIds = (locs ?? []).map((l) => l.id);
    if (!locationIds.length) {
      return (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-600">Keine kommenden Sessions.</p>
        </div>
      );
    }
    const locationTitleById = new Map((locs ?? []).map((l) => [l.id, l.title]));

    // 2) Slots dieser Locations → Map slotId → locationId
    const { data: slots } = await supa
      .from("studio_slots")
      .select("id, location_id")
      .in("location_id", locationIds);

    const slotIds = (slots ?? []).map((s) => s.id);
    if (!slotIds.length) {
      return (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-600">Keine kommenden Sessions.</p>
        </div>
      );
    }
    const slotLocById = new Map(
      (slots ?? []).map((s) => [s.id, s.location_id])
    );

    // 3) Kommende Occurrences dieser Slots
    const { data: occ } = await supa
      .from("session_occurrences")
      .select("id, session_id, studio_slot_id, starts_at, ends_at, capacity")
      .in("studio_slot_id", slotIds)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(5);

    if (!occ || !occ.length) {
      return (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-600">Keine kommenden Sessions.</p>
        </div>
      );
    }

    // 4) Session-Meta (Titel, Dauer) holen
    const sessionIds = Array.from(new Set(occ.map((o) => o.session_id)));
    const { data: sessions } = await supa
      .from("sessions")
      .select("id, title, duration_minutes")
      .in("id", sessionIds);

    const sessionMeta = new Map(
      (sessions ?? []).map((s) => [
        s.id,
        { title: s.title, dur: s.duration_minutes },
      ])
    );

    return (
      <div className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold">Nächste Sessions</h3>
        <ul className="mt-3 divide-y">
          {occ.map((o) => {
            const meta = sessionMeta.get(o.session_id);
            const slotLocId = slotLocById.get(o.studio_slot_id!);
            const locTitle = slotLocId
              ? locationTitleById.get(slotLocId)
              : undefined;
            return (
              <li key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{meta?.title ?? "Session"}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(o.starts_at).toLocaleString()}{" "}
                    {meta?.dur ? `• ${meta.dur} min` : ""}{" "}
                    {locTitle ? `• ${locTitle}` : ""}
                  </p>
                </div>
                <Link
                  className="text-sm rounded-md border px-3 py-1 hover:bg-slate-50"
                  href={`/dashboard/studiohost/sessions/${o.session_id}`}
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
          Daten nicht verfügbar (Locations/Slots/Occurrences/Sessions).
        </p>
      </div>
    );
  }
}
