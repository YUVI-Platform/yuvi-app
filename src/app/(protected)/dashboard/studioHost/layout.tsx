// src/app/dashboard/studiohost/layout.tsx
import "@/app/globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { supabaseServerRead } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import {
  Building2,
  CalendarClock,
  ClipboardList,
  PlusCircle,
} from "lucide-react";

export default async function StudioHostLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supa = await supabaseServerRead();

  // Session laden
  const { data: me } = await supa.auth.getUser();
  const user = me?.user;
  if (!user) redirect("/login?redirectTo=/dashboard/studiohost");

  // Rollen prüfen (RLS-Policy auf user_roles: "self read" muss gesetzt sein)
  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);
  const isStudioHost =
    !!roles?.some((r) => r.role === "studioHost") ||
    !!roles?.some((r) => r.role === "admin");
  if (!isStudioHost) redirect("/dashboard"); // kein Zugriff auf studiohost-Dashboard

  return (
    <div className="min-h-[100svh] grid grid-cols-[400px_1fr] bg-background">
      {/* Sidebar */}
      <aside className="border-r bg-white rounded-4xl m-6">
        <div className="p-4">
          <Link
            href="/"
            className="inline-block text-7xl font-bold tracking-tight font-fancy text-yuvi-rose"
          >
            YUVi
          </Link>
        </div>
        <nav className="px-2 py-4 space-y-1">
          <NavItem href="/dashboard/studiohost" label="Overview" />
          <NavItem
            href="/dashboard/studiohost/locations"
            label="Locations"
            icon={<Building2 size={18} />}
          />
          <NavItem
            href="/dashboard/studiohost/sessions"
            label="Sessions"
            icon={<CalendarClock size={18} />}
          />
          <NavItem
            href="/dashboard/studiohost/bookings"
            label="Bookings"
            icon={<ClipboardList size={18} />}
          />
          <div className="pt-3 mt-3 border-t" />
          <NavItem
            href="/dashboard/studiohost/sessions/new"
            label="New Session"
            icon={<PlusCircle size={18} />}
          />
          <NavItem
            href="/dashboard/studiohost/locations/new"
            label="New Location"
            icon={<PlusCircle size={18} />}
          />
        </nav>
      </aside>

      {/* Content */}
      <div className="min-h-[100svh] m-6">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b rounded-2xl">
          <div className="flex items-center justify-between px-6 py-3">
            <h1 className="text-lg font-semibold">Studio Host Dashboard</h1>
            <div className="text-sm text-slate-500">
              {/* Platz für User-Menü o.Ä. */}
            </div>
          </div>
        </header>
        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
    >
      {icon && <span className="opacity-70">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}
