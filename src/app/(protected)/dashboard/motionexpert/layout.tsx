import "@/app/globals.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { supabaseServerRead, supabaseServerAction } from "@/lib/supabaseServer";
import { CalendarClock, PlusCircle, ClipboardList, LogOut } from "lucide-react";

/** Server Action: Logout */
async function signOutAction() {
  "use server";
  const supa = await supabaseServerAction();
  await supa.auth.signOut(); // löscht Session + Cookies
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
    console.debug("[motionexpert/layout] roles", roles);
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[100svh] grid grid-cols-[320px_1fr] bg-background">
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
          <NavItem href="/dashboard/motionexpert" label="Overview" />
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
        </nav>
      </aside>

      {/* Content */}
      <div className="min-h-[100svh] m-6">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b rounded-2xl">
          <div className="flex items-center justify-between px-6 py-3">
            <h1 className="text-lg font-semibold">Motion Expert Dashboard</h1>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                title="Logout"
              >
                <LogOut size={16} className="opacity-70" />
                Logout
              </button>
            </form>
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
