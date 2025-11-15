// app/(protected)/dashboard/profile/page.tsx
"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { Edit, Check, X, Copy } from "feather-icons-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import AvatarImage from "../ui/AvatarImage";

type Role = "athlete" | "motionExpert" | "studioHost" | "admin";

function isRole(v: unknown): v is Role {
  return (
    typeof v === "string" &&
    ["athlete", "motionExpert", "studioHost", "admin"].includes(v)
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

  const [copied, setCopied] = useState(false);
  const [shineKey, setShineKey] = useState(0); // re-trigger gloss animation

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  function pickAvatar() {
    avatarInputRef.current?.click();
  }

  async function handleAvatarFile(file?: File | null) {
    if (!uid || !file) return;
    setUploadError(null);
    setUploadingAvatar(true);

    const sb = supabaseBrowser();

    // Sofortige Vorschau zeigen (Blob-URL); AvatarImage kann blob: anzeigen
    const prev = avatarUrl;
    const blobUrl = URL.createObjectURL(file);
    setAvatarUrl(blobUrl);

    try {
      const bucket = "avatars"; // <- ggf. anpassen
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${uid}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error: upErr } = await sb.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (upErr) throw upErr;

      const { data: pub } = sb.storage.from(bucket).getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error("Konnte Public URL nicht ermitteln.");

      // endgültig übernehmen; (DB-Update erfolgt beim Klick auf "Speichern")
      setAvatarUrl(publicUrl);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
          ? e
          : JSON.stringify(e);
      setUploadError(msg || "Upload fehlgeschlagen.");
      // auf vorherigen Zustand zurück
      setAvatarUrl(prev);
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Load session, profile, roles (client)
  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = supabaseBrowser();
      const { data: me } = await sb.auth.getUser();
      if (!alive) return;

      if (!me?.user) {
        setLoading(false);
        return;
      }

      const currentUid = me.user.id;
      setUid(currentUid);
      setEmail(me.user.email ?? "");

      const [{ data: prof }, { data: roleRows }] = await Promise.all([
        sb
          .from("profiles")
          .select("name, alias, avatar_url")
          .eq("user_id", currentUid)
          .maybeSingle(),
        sb.from("user_roles").select("role").eq("user_id", currentUid),
      ]);

      const fallback = prof?.name ?? me.user.email?.split("@")[0] ?? "";
      setName(prof?.name ?? fallback);
      setAlias(prof?.alias ?? fallback);
      setAvatarUrl(prof?.avatar_url ?? undefined);

      const roleList = Array.isArray(roleRows)
        ? roleRows.map((r) => r?.role).filter(isRole)
        : [];
      setRoles(roleList);

      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Derived member id
  const memberId = useMemo(() => {
    if (!uid) return "YUVI-???";
    const base = uid.replace(/-/g, "");
    const short = parseInt(base.slice(-8), 16).toString(36).toUpperCase();
    return `YUVI-${short}`;
  }, [uid]);

  // Save profile
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

  // Copy helper
  function copyMemberId() {
    navigator.clipboard
      ?.writeText(memberId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
        setShineKey((k) => k + 1); // flash gloss swipe
      })
      .catch(() => {});
  }

  // --- Mini 3D tilt interaction (no external libs) ---
  const cardRef = useRef<HTMLDivElement | null>(null);
  function onPointerMove(e: React.PointerEvent) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -8; // tilt range
    const ry = (px - 0.5) * 12;
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--tx", `${(ry * 0.2).toFixed(1)}px`);
    el.style.setProperty("--ty", `${(-rx * 0.2).toFixed(1)}px`);
  }
  function onPointerLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--tx", "0px");
    el.style.setProperty("--ty", "0px");
  }

  if (loading) {
    return (
      <div className="rounded-3xl bg-white/60 p-6 shadow-xl backdrop-blur ring-1 ring-black/5 aspect-video">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (!uid) {
    return (
      <div className="rounded-3xl bg-white/60 p-6 text-center shadow-xl backdrop-blur ring-1 ring-black/5">
        <p className="text-slate-600">
          Bitte einloggen, um deine Member Card zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-8 mt-10 aspect-video">
      {/* Card */}
      <div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className={clsx(
          "group relative mx-auto w-full max-w-sm aspect-video min-w-[350px]",
          "rounded-[22px] p-[2px]",
          "transition-transform duration-200",
          "[transform:perspective(900px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))_translate3d(var(--tx,0),var(--ty,0),0)]"
        )}
      >
        {/* Outer gradient edge */}
        <div className="absolute inset-0 -z-10 rounded-[22px] bg-gradient-to-br from-indigo-400/30 via-fuchsia-400/30 to-rose-400/30 blur-xl" />
        <div className="rounded-[20px] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4 sm:p-5 ring-1 ring-white/10">
          {/* Subtle pattern */}
          <div className="pointer-events-none absolute inset-0 rounded-[20px] [background:radial-gradient(1000px_500px_at_-30%_-40%,rgba(99,102,241,0.08),transparent),radial-gradient(800px_400px_at_120%_120%,rgba(244,63,94,0.06),transparent)]" />

          {/* GLASS / GLOSS */}
          <GlossSwipe key={shineKey} />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">
              <span className="font-fancy text-yuvi-rose">YUVi</span> • Member
              Pass
            </div>
            <div className="flex gap-2">
              <StatusDot />
              {/* Roles */}
              <div className=" flex flex-wrap gap-1.5">
                {roles.length ? (
                  roles.map((r) => (
                    <span
                      key={r}
                      className={clsx(
                        "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ring-1 ring-inset",
                        r === "admin"
                          ? "bg-rose-400/15 text-rose-200 ring-rose-300/30"
                          : r === "motionExpert"
                          ? "bg-amber-400/15 text-amber-200 ring-amber-300/30"
                          : r === "studioHost"
                          ? "bg-indigo-400/15 text-indigo-200 ring-indigo-300/30"
                          : "bg-emerald-400/15 text-emerald-200 ring-emerald-300/30"
                      )}
                    >
                      {labelRole(r)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-white/40">
                    keine Rolle zugewiesen
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Identity */}
          <div className="mt-3 flex items-center gap-3">
            <div className="relative">
              <AvatarImage src={avatarUrl} size={80} />

              {edit && (
                <>
                  {/* Overlay-Button */}
                  <button
                    onClick={pickAvatar}
                    className="absolute inset-0 grid place-items-center rounded-full bg-black/40 text-white text-[11px] opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
                    title="Avatar ändern"
                    aria-label="Avatar ändern"
                  >
                    {uploadingAvatar ? "Lädt…" : "Ändern"}
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleAvatarFile(e.target.files?.[0] ?? null)
                    }
                  />
                </>
              )}
            </div>

            <div className="min-w-0">
              {edit ? (
                <>
                  <input
                    className="w-full  rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base font-semibold text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dein Name"
                  />
                  <input
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="@alias"
                  />
                  {uploadError && (
                    <p className="mt-2 text-[11px] text-rose-300">
                      {uploadError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="truncate text-lg font-semibold text-white font-fancy tracking-widest">
                    {(name || "Dein Name").toUpperCase()}
                  </h2>
                  <p className="truncate text-xs text-white/60">
                    {alias ? `@${alias.replace(/^@/, "")}` : "—"}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-white/40">
                    {email}
                  </p>
                </>
              )}
            </div>

            {/* Edit Toggle */}
            <button
              onClick={() => setEdit((v) => !v)}
              className={
                "ml-auto rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" +
                (edit ? " hidden" : "")
              }
              title="Profil bearbeiten"
            >
              <Edit width={16} />
            </button>
          </div>

          {/* Member ID */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-white/50">
                  Mitgliedsnummer
                </p>
                <p className="truncate font-mono text-sm tracking-wider text-white">
                  {memberId}
                </p>
              </div>
              <button
                onClick={copyMemberId}
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs",
                  "bg-white/10 text-white hover:bg-white/15 active:scale-[0.98]"
                )}
                title="In Zwischenablage kopieren"
              >
                {copied ? (
                  <Check height={12} className="text-emerald-300" />
                ) : (
                  <Copy height={12} />
                )}
                {copied ? "Kopiert" : "Kopieren"}
              </button>
            </div>
            <p className="mt-1 text-[10px] leading-4 text-white/50">
              Zeig diese Karte beim Check-in. (Kein QR nötig.)
            </p>
          </div>

          {/* Edit Actions */}
          {edit && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEdit(false)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/15"
              >
                <X /> Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
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
      </div>

      {/* Styled-JSX for animations */}
      <style jsx>{`
        @keyframes yuvi-shine {
          0% {
            transform: translateX(-120%) rotate(12deg);
            opacity: 0;
          }
          10% {
            opacity: 0.45;
          }
          100% {
            transform: translateX(120%) rotate(12deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function GlossSwipe({}: { key?: number }) {
  // A moving glossy highlight that can be re-triggered
  return (
    <span
      className={clsx(
        "pointer-events-none absolute inset-0 rounded-[20px]",
        "before:absolute before:inset-0 before:rounded-[20px]",
        "after:absolute after:top-0 after:left-0 after:h-[140%] after:w-[60%] after:-translate-y-[20%]",
        "after:rounded-[32px] after:bg-gradient-to-r after:from-white/0 after:via-white/35 after:to-white/0",
        "after:[filter:blur(12px)]",
        "opacity-70"
      )}
      style={{
        // run once; you can re-trigger by changing key on parent
        // use a separate strip that animates across
        maskImage:
          "radial-gradient(120% 140% at 50% 50%, black 60%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(120% 140% at 50% 50%, black 60%, transparent 100%)",
        overflow: "hidden",
      }}
    >
      <i
        className="pointer-events-none absolute -top-6 -left-1/2 h-[140%] w-[45%]"
        style={{
          background:
            "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.28) 45%, rgba(255,255,255,0) 100%)",
          filter: "blur(10px)",
          animation: "yuvi-shine 1800ms ease-out 1",
        }}
      />
    </span>
  );
}

function StatusDot() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-300/30">
      <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-300">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/60" />
      </span>
      active
    </span>
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

export default MemberCard;
// TODO: Profile in Componente umwandeln um den Code zu vereinheitlichen
// TODO: Skeleton Loader einbauen
