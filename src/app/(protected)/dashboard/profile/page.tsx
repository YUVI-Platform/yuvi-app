// app/(protected)/dashboard/profile/page.tsx
"use client";

import Image from "next/image";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { Edit, Check, X, Download, Copy } from "feather-icons-react";
import QRCode from "qrcode";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Role = "athlete" | "motionExpert" | "studioHost" | "admin";
type SupabaseRoleRow = { role: Role };

type UserMetadata = {
  userName?: string;
  avatar_url?: string;
  // weitere Keys erlauben, aber typ-sicher:
  [key: string]: unknown;
};

function isRole(v: unknown): v is Role {
  return (
    typeof v === "string" &&
    ["athlete", "motionExpert", "studioHost", "admin"].includes(v)
  );
}

export default function ProfilePage() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-gradient-to-br from-indigo-50 to-rose-50 p-6">
      <div className="w-full max-w-[1080px]">
        <MemberCard />
      </div>
    </div>
  );
}

function MemberCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);

  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [roles, setRoles] = useState<Role[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // 1) Session, Profil & Rollen laden (Client)
  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = supabaseBrowser();

      // Session holen
      const { data: me, error: meErr } = await sb.auth.getUser();
      if (!alive) return;

      if (meErr || !me?.user) {
        setLoading(false);
        return;
      }

      const currentUid = me.user.id;
      setUid(currentUid);
      setEmail(me.user.email ?? "");

      // Profil & Rollen parallel holen
      const [
        { data: prof, error: profErr },
        { data: roleRows, error: rolesErr },
      ] = await Promise.all([
        sb
          .from("profiles")
          .select("name, alias, avatar_url")
          .eq("user_id", currentUid)
          .maybeSingle(),
        sb.from("user_roles").select("role").eq("user_id", currentUid),
      ]);

      if (profErr) console.warn("profiles select error:", profErr);
      if (rolesErr) console.warn("roles select error:", rolesErr);

      const meta = (me.user.user_metadata ?? {}) as UserMetadata;

      const fallback =
        prof?.name ?? meta.userName ?? me.user.email?.split("@")[0] ?? "";

      setName(prof?.name ?? fallback);
      setAlias(prof?.alias ?? fallback);
      setAvatarUrl(prof?.avatar_url ?? meta.avatar_url ?? undefined);

      const roleList = Array.isArray(roleRows)
        ? roleRows.map((r) => r?.role).filter(isRole) // typ-predikat -> Role[]
        : [];
      setRoles(roleList);

      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 2) QR-Code generieren
  const memberId = useMemo(() => {
    if (!uid) return "YUVI-???";
    const base = uid.replace(/-/g, "");
    const short = parseInt(base.slice(-8), 16).toString(36).toUpperCase();
    return `YUVI-${short}`;
  }, [uid]);

  const checkinPayload = useMemo(
    () => (uid ? `yuvi://checkin?uid=${uid}&v=1` : ""),
    [uid]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!checkinPayload) return;
      const url = await QRCode.toDataURL(checkinPayload, {
        width: 360,
        margin: 1,
        errorCorrectionLevel: "M",
      });
      if (alive) setQrDataUrl(url);
    })();
    return () => {
      alive = false;
    };
  }, [checkinPayload]);

  // 3) Profil speichern
  async function handleSave() {
    if (!uid) return;
    setSaving(true);
    const sb = supabaseBrowser();
    const { error } = await sb
      .from("profiles")
      .update({
        name: name.trim(),
        alias: alias.trim(),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })
      .eq("user_id", uid);

    setSaving(false);
    if (!error) setEdit(false);
    else alert(error.message);
  }

  // 4) Helpers
  function copyMemberId() {
    navigator.clipboard?.writeText(memberId).catch(() => {});
  }

  function downloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${memberId}-qr.png`;
    a.click();
  }

  if (!uid) {
    return (
      <div className="rounded-3xl bg-white/60 p-6 text-center shadow-xl backdrop-blur">
        <p className="text-slate-600">
          Bitte einloggen, um deine Member Card zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative mx-auto grid w-full grid-cols-1 gap-6 rounded-3xl bg-white p-6 shadow-2xl sm:grid-cols-2 lg:p-8",
        "ring-1 ring-black/5"
      )}
    >
      {/* LEFT: Identity */}
      <div className="flex flex-col justify-between">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl ring-1 ring-black/5">
            <Image
              src={avatarUrl || "/placeholder-avatar.png"}
              alt="Avatar"
              fill
              sizes="80px"
              className="object-cover"
              onError={() =>
                console.warn("Avatar konnte nicht geladen werden:", avatarUrl)
              }
            />
          </div>

          <div className="flex-1">
            {edit ? (
              <>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-xl font-semibold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dein Name"
                />
                <input
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-600"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="@alias"
                />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold tracking-tight">
                  {name || "Dein Name"}
                </h2>
                <p className="text-sm text-slate-500">
                  {alias ? `@${alias.replace(/^@/, "")}` : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-400">{email}</p>
              </>
            )}

            {/* Rollen */}
            <div className="mt-3 flex flex-wrap gap-2">
              {roles.length ? (
                roles.map((r) => (
                  <span
                    key={r}
                    className={clsx(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                      r === "admin"
                        ? "bg-rose-50 text-rose-700 ring-rose-200"
                        : r === "motionExpert"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : r === "studioHost"
                        ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
                        : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    )}
                  >
                    {labelRole(r)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">
                  keine Rolle zugewiesen
                </span>
              )}
            </div>
          </div>

          {/* Edit Toggle */}
          <button
            onClick={() => setEdit((v) => !v)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            title="Profil bearbeiten"
          >
            <Edit />
          </button>
        </div>

        {/* Member ID */}
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Mitgliedsnummer
              </p>
              <p className="text-lg font-semibold tracking-wider">{memberId}</p>
            </div>
            <button
              onClick={copyMemberId}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              title="In Zwischenablage kopieren"
            >
              <Copy />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Zeig diese Karte beim Check-in. Dein QR-Code verlinkt sicher auf
            deine Mitgliedschaft.
          </p>
        </div>

        {/* Edit Actions */}
        {edit && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setEdit(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
            >
              <X /> Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? (
                "Speichert…"
              ) : (
                <>
                  <Check /> Speichern
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: QR */}
      <div className="relative flex items-center justify-center">
        <div className="w-full max-w-[360px] rounded-3xl bg-slate-900/95 p-4 text-white shadow-xl ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-white/70">
              YUVi • Member Pass
            </span>
            <button
              onClick={downloadQR}
              className="rounded-md p-2 text-white/80 hover:bg-white/10"
              title="QR als PNG speichern"
            >
              <Download />
            </button>
          </div>

          <div className="mt-3 grid place-items-center rounded-2xl bg-white p-3">
            {loading ? (
              <div className="h-[300px] w-[300px] animate-pulse rounded-xl bg-slate-200" />
            ) : qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt="Member QR"
                width={300}
                height={300}
                className="rounded-md"
                priority
              />
            ) : (
              <div className="grid h-[300px] w-[300px] place-items-center text-slate-400">
                QR wird erzeugt…
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm font-medium">{name || "Dein Name"}</p>
            <p className="text-xs text-white/70">{memberId}</p>
          </div>
        </div>

        {/* Glow */}
        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-fuchsia-300/20 via-rose-300/20 to-indigo-300/20 blur-2xl" />
      </div>
    </div>
  );
}

function labelRole(r: Role) {
  switch (r) {
    case "athlete":
      return "Athlete";
    case "motionExpert":
      return "Motion Expert";
    case "studioHost":
      return "Studio Host";
    case "admin":
      return "Admin";
    default:
      return r;
  }
}
