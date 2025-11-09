// src/app/(protected)/dashboard/studiohost/layout.tsx
import "@/app/globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { supabaseServerAction, supabaseServerRead } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import {
  Building2,
  ClipboardList,
  LayoutDashboardIcon,
  LogOut,
  PlusCircle,
  User2Icon,
  Menu,
  X,
} from "lucide-react";

async function signOutAction() {
  "use server";
  const supa = await supabaseServerAction();
  await supa.auth.signOut();
  redirect("/login");
}

export default async function StudioHostLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supa = await supabaseServerRead();

  // Session & Rollen prüfen
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

  return (
    // Full-viewport Shell, kein Body-Scroll
    <div className="h-dvh w-dvw overflow-hidden bg-background">
      {/* Responsive Grid:
          - mobile: Topbar + Content (rows)
          - md+: Sidebar + Content (cols)
      */}
      <div className="grid h-full w-full grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-[280px_1fr]">
        {/* Sidebar (md+) */}
        <aside className="relative hidden h-full flex-col justify-between border-r bg-white p-4 md:flex">
          <div className="flex-1 overflow-y-auto overscroll-contain rounded-2xl">
            <div className="p-2">
              <Link
                href="/dashboard/studiohost"
                className="inline-block text-5xl font-bold tracking-tight font-fancy text-yuvi-rose"
              >
                YUVi
              </Link>
            </div>
            <nav className="mt-4 space-y-1">
              <NavItem
                href="/dashboard/studiohost"
                label="Overview"
                icon={<LayoutDashboardIcon size={18} />}
              />
              <NavItem
                href="/dashboard/studiohost/locations"
                label="Locations"
                icon={<Building2 size={18} />}
              />
              <NavItem
                href="/dashboard/studiohost/bookings"
                label="Bookings"
                icon={<ClipboardList size={18} />}
              />
              <div className="pt-3 mt-3 border-t" />
              <NavItem
                href="/dashboard/studiohost/locations/new"
                label="New Location"
                icon={<PlusCircle size={18} />}
              />
              <NavItem
                href="/dashboard/studiohost/profile"
                label="Profile"
                icon={<User2Icon size={18} />}
              />
            </nav>
          </div>

          <form action={signOutAction} className="mt-4">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-500 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut size={16} className="opacity-70" />
              Logout
            </button>
          </form>
        </aside>

        {/* Mobile Topbar + Drawer (ohne Client JS via <details>) */}
        <div className="md:hidden">
          <details className="group relative">
            <summary className="list-none">
              <header
                className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/90 px-4 py-3 backdrop-blur
                           pt-[max(env(safe-area-inset-top),0px)]"
              >
                <button
                  aria-label="Open menu"
                  className="grid h-9 w-9 place-items-center rounded-md border bg-white text-slate-700"
                >
                  {/* Icon wechselt per open/close */}
                  <Menu className="group-open:hidden" size={18} />
                  <X className="hidden group-open:block" size={18} />
                </button>
                <Link
                  href="/dashboard/studiohost"
                  className="text-2xl font-fancy font-bold tracking-tight text-yuvi-rose"
                >
                  YUVi
                </Link>
                <span className="w-9" />
              </header>
            </summary>

            {/* Drawer Panel */}
            <div className="absolute inset-x-0 top-[52px] z-30 rounded-b-2xl border-b border-x bg-white shadow-xl">
              <nav className="p-3 space-y-1">
                <NavItem
                  href="/dashboard/studiohost"
                  label="Overview"
                  icon={<LayoutDashboardIcon size={18} />}
                />
                <NavItem
                  href="/dashboard/studiohost/locations"
                  label="Locations"
                  icon={<Building2 size={18} />}
                />
                <NavItem
                  href="/dashboard/studiohost/bookings"
                  label="Bookings"
                  icon={<ClipboardList size={18} />}
                />
                <div className="pt-3 mt-3 border-t" />
                <NavItem
                  href="/dashboard/studiohost/locations/new"
                  label="New Location"
                  icon={<PlusCircle size={18} />}
                />
                <NavItem
                  href="/dashboard/studiohost/profile"
                  label="Profile"
                  icon={<User2Icon size={18} />}
                />
                <form action={signOutAction} className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-500 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10"
                    title="Logout"
                  >
                    <LogOut size={16} className="opacity-70" />
                    Logout
                  </button>
                </form>
              </nav>
            </div>
          </details>
        </div>

        {/* Content Column (scrollt eigenständig) */}
        <div className="flex h-full min-w-0 flex-col overflow-hidden">
          {/* Topbar (md+) */}
          <header className="sticky top-0 z-10 hidden shrink-0 border-b bg-white/80 px-6 py-3 backdrop-blur md:block">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Studio Host Dashboard</h1>
              <div className="text-sm text-slate-500" />
            </div>
          </header>

          {/* Scrollbarer Content */}
          <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6">
            {children}
          </main>
        </div>
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
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-yuvi-skyblue/10 hover:text-yuvi-skyblue"
    >
      {icon && <span className="opacity-70">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}
