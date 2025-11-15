import "@/app/globals.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { supabaseServerRead, supabaseServerAction } from "@/lib/supabaseServer";
import {
  CalendarClock,
  PlusCircle,
  ClipboardList,
  LogOut,
  LayoutDashboardIcon,
  Wallet2Icon,
} from "lucide-react";

/** Server Action: Logout */
async function signOutAction() {
  "use server";
  const supa = await supabaseServerAction();
  await supa.auth.signOut();
  redirect("/login");
}

export default async function MotionExpertLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supa = await supabaseServerRead();

  // Auth
  const { data: me } = await supa.auth.getUser();
  const user = me?.user;
  if (!user) redirect("/login?redirectTo=/dashboard/motionexpert");

  // Rollen prüfen (nur motionExpert oder admin)
  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isMotionExpert =
    !!roles?.some((r) => r.role === "motionExpert") ||
    !!roles?.some((r) => r.role === "admin");

  if (!isMotionExpert) {
    redirect("/dashboard");
  }

  return (
    // App-Shell: fixed an den Viewport gebunden (Body scrollt NICHT)
    <div className="fixed inset-0 bg-background md:grid md:grid-cols-[300px_1fr]">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col md:justify-between border-r bg-white m-4 rounded-3xl overflow-hidden">
        <div className="min-h-0 flex flex-col">
          <div className="p-5">
            <Link
              href="/dashboard/motionexpert"
              className="inline-block text-5xl font-bold tracking-tight font-fancy text-yuvi-rose"
            >
              YUVi
            </Link>
          </div>
          <nav
            className="px-2 pb-4 space-y-1 overflow-y-auto"
            style={{ scrollbarGutter: "stable" }}
          >
            <NavItem
              href="/dashboard/motionexpert"
              label="Overview"
              icon={<LayoutDashboardIcon size={18} />}
            />
            <NavItem
              href="/dashboard/motionexpert/sessions"
              label="Sessions"
              icon={<CalendarClock size={18} />}
            />
            <NavItem
              href="/dashboard/motionexpert/bookings"
              label="Bookings"
              icon={<ClipboardList size={18} />}
            />
            <div className="pt-3 mt-3 border-t" />
            <NavItem
              href="/dashboard/motionexpert/sessions/new"
              label="New Session"
              icon={<PlusCircle size={18} />}
            />
            <div className="pt-3 mt-3 border-t" />
            <NavItem
              href="/dashboard/motionexpert/profile"
              label="YUVi Wallet"
              icon={<Wallet2Icon size={18} />}
            />
          </nav>
        </div>

        <form action={signOutAction} className="px-6 py-4 space-y-4 mb-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md border border-red-500 px-3 py-1.5 text-sm text-red-500 cursor-pointer hover:bg-red-500/10"
            title="Logout"
          >
            <LogOut size={16} className="opacity-70" />
            Logout
          </button>
        </form>
      </aside>

      {/* Content Area (immer sichtbar; scrollt allein, kein Layout-Shift) */}
      <div className="min-h-0 flex flex-col md:m-4">
        {/* Header bleibt sichtbar, Content darunter scrollt */}
        <header className="shrink-0 sticky top-0 z-10 bg-white/80 backdrop-blur border-b md:rounded-2xl">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <h1 className="text-base md:text-lg font-semibold">
              Motion Expert Dashboard
            </h1>
          </div>
        </header>

        {/* Scrollcontainer: einzig scrollender Bereich */}
        <main
          className="min-h-0 flex-1 overflow-y-auto px-4 md:px-6 py-5 md:py-6 overscroll-contain"
          style={{ scrollbarGutter: "stable both-edges" }}
        >
          {/* Platz nach unten für die Bottom-Nav auf Mobile */}
          <div className="pb-20 md:pb-0">{children}</div>
        </main>
      </div>

      {/* Bottom Tab Bar (Mobile) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t bg-white/95 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)" }}
      >
        <div className="mx-auto grid grid-cols-4 gap-1 px-2 pt-2">
          <BottomTab
            href="/dashboard/motionexpert"
            icon={<LayoutDashboardIcon size={18} />}
            label="Home"
          />
          <BottomTab
            href="/dashboard/motionexpert/sessions"
            icon={<CalendarClock size={18} />}
            label="Sessions"
          />
          <BottomTab
            href="/dashboard/motionexpert/bookings"
            icon={<ClipboardList size={18} />}
            label="Bookings"
          />
          <BottomTab
            href="/dashboard/motionexpert/profile"
            icon={<Wallet2Icon size={18} />}
            label="Wallet"
          />
        </div>
      </nav>
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

function BottomTab({
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
      className="flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-xs text-slate-700 hover:bg-slate-100"
    >
      <span className="opacity-75">{icon}</span>
      <span className="leading-none">{label}</span>
    </Link>
  );
}
