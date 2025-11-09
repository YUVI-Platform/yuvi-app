// src/app/dashboard/studiohost/layout.tsx  (oder dein Athlete-Layout-Pfad)
// Hinweis: Du nutzt hier Athleten-Rollen – Dateiname ggf. anpassen.

import "@/app/globals.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { supabaseServerRead, supabaseServerAction } from "@/lib/supabaseServer";
import {
  LogOut,
  CalendarDays,
  Compass,
  User2,
  Ticket,
  ScanQrCodeIcon,
} from "lucide-react";

/** Server Action: Logout */
async function signOutAction() {
  "use server";
  const supa = await supabaseServerAction();
  await supa.auth.signOut();
  redirect("/login");
}

export default async function AthleteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  const user = me?.user;
  if (!user) redirect("/login?redirectTo=/dashboard/athlete");

  // Optional: Rollenprüfung (athlete oder admin)
  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isAthlete =
    !!roles?.some((r) => r.role === "athlete") ||
    !!roles?.some((r) => r.role === "admin");

  if (!isAthlete) redirect("/dashboard");

  /** Tabbar-Höhe als CSS-Variable für konsistentes Bottom-Padding im Content */
  const tabbarH = "76px";

  return (
    <div
      className="flex min-h-[100svh] flex-col bg-white text-slate-900 overscroll-y-none touch-pan-y"
      style={
        {
          // für Tailwind arbitrary values in calc():
          ["--tabbar-h"]: tabbarH,
        } as React.CSSProperties
      }
    >
      {/* iOS Safe Area top */}
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <Link
            href="/dashboard/athlete"
            className="font-fancy text-2xl font-bold text-yuvi-rose"
          >
            YUVi
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
              title="Logout"
            >
              <LogOut size={16} className="opacity-70" />
              Logout
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main
        className="
          relative mx-auto w-full max-w-md flex-1
          px-4 pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))]
          overflow-x-hidden
        "
      >
        {children}
      </main>

      {/* Bottom Tabs (app-like) */}
      <nav
        role="navigation"
        aria-label="Bottom Navigation"
        className="
          fixed inset-x-0 bottom-0 z-40
          border-t bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70
        "
      >
        <div className="mx-auto w-full max-w-md px-4">
          <div className="relative grid h-[var(--tabbar-h)] grid-cols-5 items-center">
            {/* Tabs links */}
            <Tab
              href="/dashboard/athlete"
              label="Home"
              icon={<CalendarDays size={20} />}
            />
            <Tab
              href="/dashboard/athlete/explore"
              label="Explore"
              icon={<Compass size={20} />}
            />

            {/* FAB in der Mitte */}
            <div className="pointer-events-none relative flex items-center justify-center bottom-5">
              <Link
                href="/dashboard/athlete/checkin"
                className="
                  pointer-events-auto absolute -top-5 grid h-[64px] w-[64px] place-items-center
                  rounded-2xl shadow-xl ring-1 ring-black/10
                  bg-gradient-to-tr from-yuvi-skyblue-dark to-yuvi-skyblue
                  transition-transform active:scale-95
                "
                aria-label="Check-in (QR)"
              >
                <ScanQrCodeIcon size={30} className="text-white" />
              </Link>
            </div>

            <Tab
              href="/dashboard/athlete/bookings"
              label="Bookings"
              icon={<Ticket size={20} />}
            />
            <Tab
              href="/dashboard/athlete/profile"
              label="Profile"
              icon={<User2 size={20} />}
            />
          </div>
        </div>
        {/* iOS Safe Area bottom */}
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}

function Tab({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        group flex h-full flex-col items-center justify-center
        gap-0.5 text-xs text-slate-700 hover:bg-slate-50
        active:opacity-80
      "
    >
      <span
        className="
          grid h-6 w-6 place-items-center rounded-md
          group-active:scale-95 transition-transform
        "
      >
        {icon}
      </span>
      <span className="leading-none">{label}</span>
    </Link>
  );
}
