// src/app/(protected)/dashboard/motionexpert/occ/[id]/checkin/CheckinClient.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "@/lib/supabaseBrowser";
import { QR } from "@/components/qr/QR";
import PaypalIcon from "@/components/icons/paypal";
import { buildPaypalUrl } from "@/lib/payments/paypal";
import { useBookingsRealtime } from "@/lib/realtime/useBookingsRealtime";

/* ----------------------------- Types & tokens ----------------------------- */

type BookingRow = {
  id: string;
  athlete_user_id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  payment: "none" | "reserved" | "paid" | "refunded";
  checked_in_at: string | null;
  profile: { name: string; avatar_url: string | null };
};

const UI = {
  panel:
    "flex flex-col items-center gap-4 rounded-xl border p-6 transition-all duration-300 ease-in-out bg-gradient-to-bl",
  panelPay: "from-green-100 to-green-200",
  panelCheck: "from-yuvi-skyblue to-yuvi-skyblue-dark",
  card: "w-full max-w-md rounded-xl border bg-white p-6 shadow-sm",
  h2: "mb-1 text-lg font-semibold",
  sub: "text-xs text-slate-500",
  btnBase: "rounded-md px-3 py-1.5 text-sm transition active:translate-y-px",
  btnGhost:
    "rounded-md px-3 py-1.5 text-sm transition active:translate-y-px border bg-slate-50 hover:bg-slate-100",
  btnPrimary:
    "rounded-md px-3 py-1.5 text-sm transition active:translate-y-px text-white bg-[#0070e0] hover:bg-[#003087]",
  btnDanger:
    "rounded-md px-3 py-1.5 text-sm transition active:translate-y-px text-white bg-red-500 hover:bg-red-400",
};

/* ----------------------------- Small utilities ---------------------------- */

// Robust: akzeptiert absolute URLs, /storage/v1/... Pfade, bucket/key, oder nur key (fällt auf "avatars" zurück)
function toPublicImageUrl(raw?: string | null): string | null {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;

  if (raw.startsWith("/storage/v1/object/"))
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${raw}`;
  if (raw.startsWith("storage/v1/object/"))
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/${raw}`;

  const mPublic = raw.match(
    /^(?:\/?storage\/v1\/)?object\/public\/([^/]+)\/(.+)$|^public\/([^/]+)\/(.+)$/
  );
  if (mPublic) {
    const bucket = mPublic[1] || mPublic[3];
    const key = mPublic[2] || mPublic[4];
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${key}`;
  }

  const firstSlash = raw.indexOf("/");
  const bucket = firstSlash > 0 ? raw.slice(0, firstSlash) : "avatars";
  const key = firstSlash > 0 ? raw.slice(firstSlash + 1) : raw;
  return supabase.storage.from(bucket).getPublicUrl(key).data.publicUrl ?? null;
}

function formatTime(ts?: string | null) {
  return ts ? new Date(ts).toLocaleTimeString() : "";
}

/* --------------------------------- Hooks ---------------------------------- */

// Tick für Countdown
function useNowTick() {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// Session-Metadaten (Preis/Title/PayPal-Link) laden
function useSessionMeta(occId: string) {
  const [priceEUR, setPriceEUR] = React.useState<number | undefined>();
  const [sessionTitle, setSessionTitle] = React.useState<string>("");
  const [payBaseLink, setPayBaseLink] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const { data: occ } = await supabase
        .from("session_occurrences")
        .select("session_id")
        .eq("id", occId)
        .maybeSingle();
      if (!occ) return;

      const { data: s } = await supabase
        .from("sessions")
        .select("price_cents, title, expert_user_id")
        .eq("id", occ.session_id)
        .maybeSingle();
      if (!s) return;

      if (!alive) return;
      setPriceEUR(
        typeof s.price_cents === "number" ? s.price_cents / 100 : undefined
      );
      setSessionTitle(s.title ?? "Session");

      const { data: mep } = await supabase
        .from("motion_expert_profiles")
        .select("paypal_link")
        .eq("user_id", s.expert_user_id)
        .maybeSingle();
      if (!alive) return;
      setPayBaseLink(mep?.paypal_link ?? null);
    })();
    return () => {
      alive = false;
    };
  }, [occId]);

  const paypalUrl = React.useMemo(
    () => (payBaseLink ? buildPaypalUrl(payBaseLink, priceEUR) : ""),
    [payBaseLink, priceEUR]
  );

  return { priceEUR, sessionTitle, paypalUrl };
}

// Initiale Profile hydratisieren (Name/Alias/Avatar)
function useHydrateProfiles(initial: BookingRow[]) {
  const [rows, setRows] = React.useState<BookingRow[]>(initial ?? []);
  const hydratedOnce = React.useRef(false);

  React.useEffect(() => {
    if (hydratedOnce.current) return;
    hydratedOnce.current = true;

    const uids = Array.from(
      new Set((initial ?? []).map((b) => b.athlete_user_id))
    );
    if (!uids.length) return;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, name, alias, avatar_url")
        .in("user_id", uids);

      if (!data?.length) return;

      setRows((prev) =>
        prev.map((r) => {
          const p = data.find((d) => d.user_id === r.athlete_user_id);
          if (!p) return r;
          return {
            ...r,
            profile: {
              name: p.alias ?? p.name ?? r.athlete_user_id,
              avatar_url: toPublicImageUrl(p.avatar_url) ?? "/avatar.png",
            },
          };
        })
      );
    })();
  }, [initial]);

  const removeById = React.useCallback(
    (id: string) => setRows((prev) => prev.filter((r) => r.id !== id)),
    []
  );

  const upsertWithProfile = React.useCallback(
    async (b: {
      id: string;
      athlete_user_id: string;
      status: BookingRow["status"];
      payment: BookingRow["payment"];
      checked_in_at: string | null;
    }) => {
      let profile = rows.find(
        (r) => r.athlete_user_id === b.athlete_user_id
      )?.profile;

      if (!profile) {
        const { data: p } = await supabase
          .from("profiles")
          .select("user_id, name, alias, avatar_url")
          .eq("user_id", b.athlete_user_id)
          .maybeSingle();

        profile = p
          ? {
              name: p.alias ?? p.name ?? b.athlete_user_id,
              avatar_url: toPublicImageUrl(p.avatar_url) ?? "/avatar.png",
            }
          : { name: b.athlete_user_id, avatar_url: "/avatar.png" };
      }

      setRows((prev) => {
        const idx = prev.findIndex((x) => x.id === b.id);
        const merged: BookingRow = { ...b, profile };
        if (idx === -1) return [...prev, merged];
        const next = [...prev];
        next[idx] = { ...next[idx], ...merged };
        return next;
      });
    },
    [rows]
  );

  return { rows, setRows, upsertWithProfile, removeById };
}

/* ------------------------------- UI pieces -------------------------------- */

function Panel({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={clsx(UI.panel, active ? UI.panelPay : UI.panelCheck)}>
      {children}
    </div>
  );
}

function PaypalCard({
  paypalUrl,
  priceEUR,
  sessionTitle,
  onCopy,
  copied,
}: {
  paypalUrl: string;
  priceEUR?: number;
  sessionTitle: string;
  onCopy: () => void;
  copied: boolean;
}) {
  if (!paypalUrl) {
    return (
      <div className={UI.card}>
        <div className="text-sm text-slate-600">
          Kein PayPal-Link hinterlegt.{" "}
          <Link
            href="/(protected)/dashboard/motionexpert/profile"
            className="underline"
          >
            In Zahlungseinstellungen hinzufügen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={UI.card}>
      <div className="flex flex-col items-center gap-4">
        <h2 className={UI.h2}>Schnell bezahlen</h2>
        <p className={UI.sub}>
          Öffne PayPal oder scanne den QR-Code{" "}
          {typeof priceEUR === "number" && (
            <span className="text-emerald-400 font-bold">
              {" "}
              • {priceEUR.toFixed(2)} €
            </span>
          )}
        </p>
        <QR value={paypalUrl} size={200} />
        <div className="flex flex-wrap gap-2">
          <a
            href={paypalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={UI.btnPrimary}
            aria-label={
              sessionTitle
                ? `Mit PayPal zahlen für ${sessionTitle}`
                : "Mit PayPal zahlen"
            }
          >
            PayPal öffnen
          </a>
          <button type="button" onClick={onCopy} className={UI.btnGhost}>
            {copied ? "Link kopiert" : "Link kopieren"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckinCard({ qrUrl, token }: { qrUrl: string; token: string }) {
  return (
    <div className={UI.card}>
      <div className="flex flex-col items-center gap-4">
        <QR value={qrUrl} size={280} />
        <p className={UI.sub}>Fallback-Code</p>
        <p className="text-2xl font-mono tracking-widest">{token}</p>
      </div>
    </div>
  );
}

function StatusSection({
  title,
  items,
  rightLabel,
}: {
  title: string;
  items: BookingRow[];
  rightLabel?: (r: BookingRow) => string;
}) {
  return (
    <section className="rounded-xl border bg-white p-4">
      <h2 className="font-semibold mb-3">
        {title} ({items.length})
      </h2>
      <ul className="space-y-2">
        {items.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-lg border px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <Image
                src={r.profile?.avatar_url ?? "/avatar.png"}
                alt={r.profile?.name ?? "Avatar"}
                width={20}
                height={20}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="text-sm">
                <div className="font-medium">
                  {r.profile?.name ?? r.athlete_user_id}
                </div>
                <div className="text-xs text-slate-500">
                  {r.checked_in_at
                    ? formatTime(r.checked_in_at)
                    : `Status: ${
                        r.status === "pending" ? "Reserviert" : "Bestätigt"
                      }`}
                </div>
              </div>
            </div>
            <span
              className={
                "text-xs rounded-full px-2 py-0.5 ring-1 " +
                (r.payment === "paid"
                  ? "bg-green-50 text-green-700 ring-green-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200")
              }
            >
              {rightLabel
                ? rightLabel(r)
                : r.payment === "paid"
                ? "Bezahlt"
                : "Offen"}
            </span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-slate-500">Keine Einträge.</li>
        )}
      </ul>
    </section>
  );
}

/* ------------------------------- Main view -------------------------------- */

export default function CheckinClient({
  occId,
  qrUrl,
  token,
  expiresAt,
  initialBookings,
}: {
  occId: string;
  qrUrl: string;
  token: string;
  expiresAt: string;
  initialBookings: BookingRow[];
}) {
  const now = useNowTick();
  const exp = new Date(expiresAt).getTime();
  const msLeft = Math.max(0, exp - now);
  const expired = msLeft <= 0;
  const mm = String(Math.floor(msLeft / 60000)).padStart(2, "0");
  const ss = String(Math.floor((msLeft % 60000) / 1000)).padStart(2, "0");

  const { priceEUR, sessionTitle, paypalUrl } = useSessionMeta(occId);
  const { rows, upsertWithProfile, removeById } =
    useHydrateProfiles(initialBookings);

  // Realtime — sauberes Listener-Pattern über dein Hook
  const handleRealtime = React.useCallback(
    (evt: "INSERT" | "UPDATE" | "DELETE", row: any) => {
      if (evt === "DELETE") {
        removeById(row.id);
      } else {
        void upsertWithProfile({
          id: row.id,
          athlete_user_id: row.athlete_user_id,
          status: row.status,
          payment: row.payment,
          checked_in_at: row.checked_in_at,
        });
      }
    },
    [removeById, upsertWithProfile]
  );
  useBookingsRealtime(occId, handleRealtime);

  const checkedIn = React.useMemo(
    () =>
      rows
        .filter(
          (r) =>
            !!r.checked_in_at &&
            (r.status === "confirmed" || r.status === "completed")
        )
        .sort((a, b) =>
          (a.checked_in_at || "").localeCompare(b.checked_in_at || "")
        ),
    [rows]
  );
  const expected = React.useMemo(
    () => rows.filter((r) => !r.checked_in_at && r.status !== "cancelled"),
    [rows]
  );

  const [startPayment, setStartPayment] = React.useState(false);
  const [copiedPay, setCopiedPay] = React.useState(false);
  const copyPayUrl = React.useCallback(async () => {
    if (!paypalUrl) return;
    await navigator.clipboard.writeText(paypalUrl);
    setCopiedPay(true);
    setTimeout(() => setCopiedPay(false), 1500);
  }, [paypalUrl]);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Check-in • {sessionTitle}</h1>
        <p className="text-sm text-slate-600">
          Gültig bis {new Date(expiresAt).toLocaleTimeString()}{" "}
          {!expired && (
            <span>
              ({mm}:{ss})
            </span>
          )}
        </p>
      </header>

      <Panel active={startPayment}>
        <AnimatePresence initial={false} mode="wait">
          {startPayment ? (
            <motion.div
              key="pay"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <PaypalCard
                paypalUrl={paypalUrl}
                priceEUR={priceEUR}
                sessionTitle={sessionTitle}
                onCopy={copyPayUrl}
                copied={copiedPay}
              />
            </motion.div>
          ) : (
            <motion.div
              key="check"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <CheckinCard qrUrl={qrUrl} token={token} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={UI.btnGhost}
            onClick={() => navigator.clipboard.writeText(token)}
          >
            Code kopieren
          </button>

          <Link href="?refresh=1" className={UI.btnGhost}>
            Code neu erzeugen
          </Link>

          <button
            onClick={() => setStartPayment((v) => !v)}
            className={clsx(
              startPayment ? UI.btnDanger : UI.btnPrimary,
              "flex items-center gap-2"
            )}
          >
            {startPayment ? "Zahlung abbrechen" : "Zahlung starten"}
            <PaypalIcon size={20} color="#ffffff" />
          </button>
        </div>

        {expired && (
          <div className="w-full rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
            Der Code ist abgelaufen.{" "}
            <a href="?refresh=1" className="underline">
              Jetzt neuen Code erzeugen
            </a>
          </div>
        )}
      </Panel>

      {/* Teilnehmerstatus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatusSection
          title="Eingecheckt"
          items={checkedIn}
          rightLabel={(r) => (r.payment === "paid" ? "Bezahlt" : "Offen")}
        />
        <StatusSection
          title="Erwartet"
          items={expected}
          rightLabel={(r) => (r.payment === "paid" ? "Bezahlt" : "Offen")}
        />
      </div>
    </div>
  );
}

//TODO: FARBEN VEREINHEITLICHEN
//TODO: Transition animations für qr codes
//TODO: GLOBAL TRANSITIONS UND INTRO UND LOADING ANIMATIONS
//TODO: GLOBALE HElLPER FÜR IMAGE UPLOADS UND ALLE SUPABASE INTERACTIONS DIE OFT GENUTZT WERDEN
//TODO: TOASTS IMPLEMENTIEREN
//TODO: BEST PRACTICES FÜR ONLY ONE FUNKTION PER COMPONENT BEACHTEN
// TODO: CHECKIN ZEITFENSTER SO DAS MAN SESSIONS ERST 20MIN VORBEGIN einN CHECKINNEN KANN
