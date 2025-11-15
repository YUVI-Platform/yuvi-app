// app/admin/invites/page.tsx
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/requireAdmin";
import { listInvites } from "./actions";
import InviteForm from "./ui/inviteForm";
import InviteList from "./ui/inviteList";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { LogOut } from "lucide-react";

export const dynamic = "force-dynamic"; // immer frische Liste

export default async function AdminInvitesPage() {
  const gate = await requireAdmin({ devBypass: true });
  if (!gate.ok) redirect("/login?redirectTo=/admin/invites");

  const invites = await listInvites(); // serverseitig (Service Role)

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8 min-h-screen">
      {process.env.NODE_ENV !== "production" &&
        process.env.ADMIN_BYPASS === "1" && (
          <div className="mb-4 rounded-md border border-yellow-400 bg-yellow-50 p-3 text-sm">
            DEV BYPASS ACTIVE – Admin-Rollencheck ist deaktiviert.
          </div>
        )}
      <h1 className="text-2xl font-semibold">Admin · Invites</h1>

      <InviteForm />
      <InviteList invites={invites} />
    </div>
  );
}
