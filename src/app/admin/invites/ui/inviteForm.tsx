// src/app/admin/invites/ui/inviteForm.tsx
"use client";

import { useState } from "react";
import { createInvite } from "../actions";
import Button from "@/components/ui/button";
import { CopyIcon } from "lucide-react";

type Role = "athlete" | "motionExpert" | "studioHost";
type CreateInviteArgs = {
  role: Role;
  max_uses: number;
  expires_at: string | null;
};

const roles: { value: Role; label: string }[] = [
  { value: "athlete", label: "Athlete" },
  { value: "motionExpert", label: "Motion Expert" },
  { value: "studioHost", label: "Studio Host" },
];

export default function InviteForm() {
  const [role, setRole] = useState<Role>("athlete");
  const [maxUses, setMaxUses] = useState<number>(1);
  const [expiresLocal, setExpiresLocal] = useState<string>(""); // datetime-local string
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  function toISOFromLocal(local: string): string | null {
    if (!local) return null;
    // local e.g. "2025-11-04T09:00"
    const d = new Date(local);
    return Number.isNaN(+d) ? null : d.toISOString();
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const payload: CreateInviteArgs = {
        role,
        max_uses: Math.max(1, maxUses | 0),
        expires_at: toISOFromLocal(expiresLocal),
      };
      const res = await createInvite(payload);
      const url = `${baseUrl}/register?code=${res.code}`;
      setCreatedUrl(url);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to create invite link";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-2xl border p-4 space-y-4 bg-white">
      <h2 className="text-lg font-medium">Einladung erstellen</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Rolle</label>
          <select
            className="w-full rounded-md border px-3 py-2 bg-white"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Max. Verwendungen</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(parseInt(e.target.value || "1", 10))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Läuft ab am (optional)</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="datetime-local"
            value={expiresLocal}
            onChange={(e) => setExpiresLocal(e.target.value)}
          />
        </div>
      </div>

      <Button
        disabled={loading}
        onClick={handleCreate}
        className="cursor-pointer hover:bg-emerald-500"
      >
        {loading ? "erstellen…" : "Einladung erstellen"}
      </Button>

      {createdUrl && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500 p-3 text-sm flex items-center justify-between ">
          <span className="truncate">{createdUrl}</span>
          <Button
            size="sm"
            onClick={copyToClipboard}
            className={
              "flex w-fit justify-between items-center cursor-pointer hover:bg-black/70 transform duration-300 " +
              (copied ? " bg-emerald-500" : "")
            }
          >
            {copied ? "Kopiert!" : "Kopieren"}
            <CopyIcon height={10} />
          </Button>
        </div>
      )}
    </div>
  );
}
