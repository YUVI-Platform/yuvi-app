"use client";

import { useState } from "react";
import { createInvite } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatISO } from "date-fns";
import { z } from "zod";

const roles = [
  { value: "athlete", label: "Athlete" },
  { value: "motionExpert", label: "Motion Expert" },
  { value: "studioHost", label: "Studio Host" },
] as const;

export default function InviteForm() {
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("athlete");
  const [maxUses, setMaxUses] = useState(1);
  const [expires, setExpires] = useState<Date | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // kleine helper für Client
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <h2 className="text-lg font-medium">Create Invite</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Rolle</Label>
          <Select value={role} onValueChange={(v) => setRole(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Rolle auswählen" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Max. Verwendungen</Label>
          <Input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(parseInt(e.target.value || "1", 10))}
          />
        </div>

        <div className="space-y-2">
          <Label>Läuft ab am (optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {expires ? expires.toLocaleString() : "Datum wählen"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-2">
              <Calendar
                mode="single"
                selected={expires ?? undefined}
                onSelect={(d) => setExpires(d ?? null)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          try {
            const res = await createInvite({
              role,
              max_uses: maxUses,
              expires_at: expires ? formatISO(expires) : null,
            } as any);

            const url = `${baseUrl}/register?code=${res.code}`;
            setCreatedUrl(url);
          } catch (e: any) {
            alert(e.message ?? "Failed to create");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Creating…" : "Create invite"}
      </Button>

      {createdUrl && (
        <div className="rounded-lg bg-muted p-3 text-sm flex items-center justify-between">
          <span className="truncate">{createdUrl}</span>
          <Button
            size="sm"
            onClick={() => navigator.clipboard.writeText(createdUrl)}
          >
            Kopieren
          </Button>
        </div>
      )}
    </div>
  );
}
