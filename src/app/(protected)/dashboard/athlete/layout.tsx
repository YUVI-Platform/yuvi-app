import "@/app/globals.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { supabaseServerRead, supabaseServerAction } from "@/lib/supabaseServer";
import { LogOut, CalendarDays, Compass, User2, Ticket } from "lucide-react";

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

  return (
    <div className="min-h-[100svh] bg-white text-slate-900">
      {/* iOS Safe Area paddings */}
      <div className="pt-[env(safe-area-inset-top)]" />
      {/* App Header */}
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur border-b">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard/athlete"
            className="font-fancy text-2xl font-bold text-yuvi-rose"
          >
            YUVi
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
              title="Logout"
            >
              <LogOut size={16} className="opacity-70" />
              Logout
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md px-4 pb-24">{children}</main>

      {/* Bottom Tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md border-t bg-white/95 backdrop-blur">
        <div className="grid grid-cols-4">
          <Tab
            href="/dashboard/athlete"
            label="Home"
            icon={<CalendarDays size={18} />}
          />
          <Tab
            href="/dashboard/athlete/explore"
            label="Explore"
            icon={<Compass size={18} />}
          />
          <Tab
            href="/dashboard/athlete/bookings"
            label="Bookings"
            icon={<Ticket size={18} />}
          />
          <Tab
            href="/dashboard/athlete/profile"
            label="Profile"
            icon={<User2 size={18} />}
          />
        </div>
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
      className="flex flex-col items-center justify-center py-2 text-xs text-slate-700 hover:bg-slate-50"
    >
      <span className="opacity-80">{icon}</span>
      <span className="mt-0.5">{label}</span>
    </Link>
  );
}
