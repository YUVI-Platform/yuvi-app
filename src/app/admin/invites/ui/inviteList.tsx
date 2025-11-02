// app/admin/invites/ui/InviteList.tsx
"use client";

import { toggleInvite, deleteInvite } from "../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTransition } from "react";

type Invite = {
  code: string;
  role: "athlete" | "motionExpert" | "studioHost";
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string | null;
  expires_at: string | null;
};

export default function InviteList({ invites }: { invites: Invite[] }) {
  const [pending, start] = useTransition();

  if (!invites.length) {
    return <div className="text-sm text-muted-foreground">No invites yet.</div>;
  }

  return (
    <div className="rounded-2xl border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">Existing Invites</h2>
      </div>

      <div className="divide-y">
        {invites.map((i) => {
          const url = `/register?code=${i.code}`;
          const expired = !!(
            i.expires_at && new Date(i.expires_at) < new Date()
          );
          const usable = i.used_count < i.max_uses && !expired && i.is_active;

          return (
            <div
              key={i.code}
              className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="font-mono text-sm">{i.code}</div>
                <div className="text-sm text-muted-foreground">
                  Role: {i.role} · Uses: {i.used_count}/{i.max_uses} ·
                  {i.expires_at
                    ? ` Expires: ${new Date(i.expires_at).toLocaleString()}`
                    : " No expiry"}
                </div>
                <div className="flex gap-2">
                  <Badge variant={i.is_active ? "default" : "secondary"}>
                    {i.is_active ? "active" : "inactive"}
                  </Badge>
                  {expired && <Badge variant="destructive">expired</Badge>}
                  {!expired && usable && (
                    <Badge variant="outline">usable</Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(url)}
                >
                  Copy link
                </Button>
                <Button
                  variant={i.is_active ? "secondary" : "default"}
                  disabled={pending}
                  onClick={() =>
                    start(() => toggleInvite(i.code, !i.is_active))
                  }
                >
                  {i.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="destructive"
                  disabled={pending}
                  onClick={() => {
                    if (confirm("Delete this invite?"))
                      start(() => deleteInvite(i.code));
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
