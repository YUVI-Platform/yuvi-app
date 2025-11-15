// src/app/(protected)/dashboard/motionexpert/occ/[id]/page.tsx
import "server-only";
import Image from "next/image";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { supabaseServerRead, supabaseServerAction } from "@/lib/supabaseServer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import ChipInput from "@/components/Form/ChipInput";
import SessionImagesEditor from "./SessionImagesEditor";

type Session = {
  id: string;
  expert_user_id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  equipment: string[] | null;
  image_urls: string[] | null;
  price_cents: number;
  recommended_level: string | null;
  location_type: "self_hosted" | "studio_location";
  self_hosted_location_id: string | null;
  studio_location_id: string | null;
};

type Occurrence = {
  id: string;
  session_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  studio_slot_id: string | null;
  self_hosted_slot_id: string | null;
  override_lat: number | null;
  override_lng: number | null;
};

type StudioLocation = {
  id: string;
  title: string;
  image_urls: string[] | null;
  address: any;
};

type SelfHostedLocation = {
  id: string;
  title: string | null;
  image_urls: string[] | null;
  address: any;
};

type Booking = {
  id: string;
  athlete_user_id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  payment: "none" | "reserved" | "paid" | "refunded";
  checked_in_at: string | null;
};

type Profile = {
  user_id: string;
  name: string;
  alias: string | null;
  avatar_url: string | null;
};

function euro(cents?: number) {
  if (typeof cents !== "number") return "—";
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

async function toPublicImageUrl(
  raw: string | null | undefined
): Promise<string | null> {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (raw.startsWith("/storage/v1/object/")) return `${base}${raw}`;
  if (raw.startsWith("storage/v1/object/")) return `${base}/${raw}`;

  const mPublic = raw.match(
    /^(?:\/?storage\/v1\/)?object\/public\/([^/]+)\/(.+)$|^public\/([^/]+)\/(.+)$/
  );
  if (mPublic) {
    const bucket = mPublic[1] || mPublic[3];
    const key = mPublic[2] || mPublic[4];
    return `${base}/storage/v1/object/public/${bucket}/${key}`;
  }

  const firstSlash = raw.indexOf("/");
  const bucket = firstSlash > 0 ? raw.slice(0, firstSlash) : "avatars";
  const key = firstSlash > 0 ? raw.slice(firstSlash + 1) : raw;
  const supa = await supabaseServerRead();
  return supa.storage.from(bucket).getPublicUrl(key).data.publicUrl ?? null;
}

/* --------------------------------- Actions -------------------------------- */

/** Session-Stammdaten aktualisieren -> Promise<void> für <form action> */
async function updateSessionAction(formData: FormData): Promise<void> {
  "use server";
  const supa = await supabaseServerAction();

  const sessionId = String(formData.get("session_id"));
  const occurrenceId = String(formData.get("occurrence_id") || ""); // wichtig für Detail-Revalidate

  const title = String(formData.get("title") || "");
  const description = (formData.get("description") as string) || null;
  const price = Number(formData.get("price_eur") || "0");
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let equipment: string[] = [];
  const eqJson = formData.get("equipment_json") as string | null;
  if (eqJson) {
    try {
      equipment = JSON.parse(eqJson) ?? [];
    } catch {
      /* ignore */
    }
  } else {
    equipment = String(formData.get("equipment") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const level = (formData.get("recommended_level") as string) || null;

  const me = await supa.auth.getUser();
  const { data: s } = await supa
    .from("sessions")
    .select("expert_user_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!s || s.expert_user_id !== me?.data.user?.id) {
    throw new Error("not_allowed");
  }

  const { error } = await supa
    .from("sessions")
    .update({
      title,
      description,
      price_cents: Math.round(price * 100),
      tags,
      equipment: equipment.length ? equipment : null,
      recommended_level: level,
    })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/motionexpert/occ`);
  if (occurrenceId) {
    revalidatePath(`/dashboard/motionexpert/occ/${occurrenceId}`);
  }
}

/** Occurrence aktualisieren -> Promise<void> für <form action> */
async function updateOccurrenceAction(formData: FormData): Promise<void> {
  "use server";
  const supa = await supabaseServerAction();
  const occurrenceId = String(formData.get("occurrence_id"));
  const starts = String(formData.get("starts_at") || "");
  const ends = String(formData.get("ends_at") || "");
  const capacity = Number(formData.get("capacity"));

  const { data: occ } = await supa
    .from("session_occurrences")
    .select("id, session_id")
    .eq("id", occurrenceId)
    .maybeSingle();
  if (!occ) throw new Error("occ_not_found");

  const me = await supa.auth.getUser();
  const { data: ses } = await supa
    .from("sessions")
    .select("expert_user_id")
    .eq("id", occ.session_id)
    .maybeSingle();
  if (!ses || ses.expert_user_id !== me?.data.user?.id) {
    throw new Error("not_allowed");
  }

  const toISO = (v: string) => (v ? new Date(v).toISOString() : undefined);

  const { error } = await supa
    .from("session_occurrences")
    .update({
      starts_at: toISO(starts),
      ends_at: toISO(ends),
      capacity:
        Number.isFinite(capacity) && capacity > 0 ? capacity : undefined,
    })
    .eq("id", occurrenceId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/motionexpert/occ/${occurrenceId}`);
}

/** Nur Bilder aktualisieren -> Promise<void> für <form action> */
async function updateSessionImagesAction(formData: FormData): Promise<void> {
  "use server";
  const supa = await supabaseServerAction();

  const sessionId = String(formData.get("session_id"));
  const imagesJson = String(formData.get("images_json") || "[]");

  let images: string[] = [];
  try {
    images = JSON.parse(imagesJson);
  } catch {
    /* ignore */
  }

  const me = await supa.auth.getUser();
  const { data: s } = await supa
    .from("sessions")
    .select("expert_user_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!s || s.expert_user_id !== me?.data.user?.id) {
    throw new Error("not_allowed");
  }

  const { error } = await supa
    .from("sessions")
    .update({ image_urls: images.length ? images : null })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/motionexpert/occ`);
  // Detailseite wird über sessionId nicht eindeutig gefunden; daher Liste reicht hier
}

/* --------------------------------- Loader --------------------------------- */

async function loadOccurrencePageData(occId: string, currentUserId: string) {
  const supa = await supabaseServerRead();

  const { data: occ, error: e1 } = await supa
    .from("session_occurrences")
    .select(
      "id, session_id, starts_at, ends_at, capacity, studio_slot_id, self_hosted_slot_id, override_lat, override_lng"
    )
    .eq("id", occId)
    .maybeSingle();

  if (e1 || !occ) return { kind: "not_found" as const };

  const { data: session, error: e2 } = await supa
    .from("sessions")
    .select(
      "id, expert_user_id, title, description, tags, equipment, image_urls, price_cents, recommended_level, location_type, self_hosted_location_id, studio_location_id"
    )
    .eq("id", occ.session_id)
    .maybeSingle();

  if (e2 || !session) return { kind: "not_found" as const };
  if (session.expert_user_id !== currentUserId)
    return { kind: "forbidden" as const };

  // Location laden
  let location: (StudioLocation | SelfHostedLocation) | null = null;
  if (
    session.location_type === "studio_location" &&
    session.studio_location_id
  ) {
    const { data: loc } = await supa
      .from("studio_locations")
      .select("id, title, image_urls, address")
      .eq("id", session.studio_location_id)
      .maybeSingle();
    location = loc ?? null;
  } else if (
    session.location_type === "self_hosted" &&
    session.self_hosted_location_id
  ) {
    const { data: loc } = await supa
      .from("self_hosted_locations")
      .select("id, title, image_urls, address")
      .eq("id", session.self_hosted_location_id)
      .maybeSingle();
    location = (loc as any) ?? null;
  }

  // Bookings
  const { data: bookings } = await supa
    .from("bookings")
    .select("id, athlete_user_id, status, payment, checked_in_at")
    .eq("occurrence_id", occ.id)
    .order("created_at", { ascending: true });

  const uids = Array.from(
    new Set((bookings ?? []).map((b) => b.athlete_user_id))
  );
  let profiles: Profile[] = [];
  if (uids.length) {
    const { data: ps } = await supa
      .from("profiles")
      .select("user_id, name, alias, avatar_url")
      .in("user_id", uids);
    profiles = ps ?? [];
  }

  // Bilder (Session + Location) zu public URLs auflösen
  const sessionImageUrls = await Promise.all(
    (session.image_urls ?? []).map((u) => toPublicImageUrl(u))
  ).then((arr) => arr.filter(Boolean) as string[]);

  const locationImageUrls = await Promise.all(
    ((location?.image_urls as string[] | null) ?? []).map((u) =>
      toPublicImageUrl(u)
    )
  ).then((arr) => arr.filter(Boolean) as string[]);

  // Avatare ebenfalls zu absoluten Public-URLs auflösen
  const bookingsEnriched = await Promise.all(
    (bookings ?? []).map(async (b) => {
      const p = profiles.find((x) => x.user_id === b.athlete_user_id);
      const avatar = await toPublicImageUrl(p?.avatar_url ?? null);
      return {
        ...b,
        name: p?.alias || p?.name || b.athlete_user_id,
        avatar_url: avatar ?? "/avatar.png",
      };
    })
  );

  return {
    kind: "ok" as const,
    occ,
    session,
    location: location ? { ...location, image_urls: locationImageUrls } : null,
    sessionImages: sessionImageUrls,
    bookings: bookingsEnriched,
  };
}

/* ---------------------------------- Page ---------------------------------- */

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: occId } = await params; // ⬅️ params erst awaiten

  const supa = await supabaseServerRead();
  const me = await supa.auth.getUser();
  if (!me.data.user) redirect("/login?redirectTo=/dashboard/motionexpert");

  const data = await loadOccurrencePageData(occId, me.data.user.id);

  if (data.kind === "not_found") notFound();
  if (data.kind === "forbidden") redirect("/dashboard/motionexpert");

  const { occ, session, location, sessionImages, bookings } = data;

  const checkedIn = bookings
    .filter(
      (r) =>
        !!r.checked_in_at &&
        (r.status === "confirmed" || r.status === "completed")
    )
    .sort((a, b) =>
      (a.checked_in_at || "").localeCompare(b.checked_in_at || "")
    );
  const expected = bookings.filter(
    (r) => !r.checked_in_at && r.status !== "cancelled"
  );

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{session.title}</h1>
          <p className="text-sm text-slate-600">
            {new Date(occ.starts_at).toLocaleString()} –{" "}
            {new Date(occ.ends_at).toLocaleTimeString()} • Kapazität{" "}
            {occ.capacity} • {euro(session.price_cents)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-yuvi-rose text-rose-500">
              {session.location_type === "studio_location"
                ? "Studio"
                : "Self-Hosted"}
            </Badge>
            {session.recommended_level && (
              <Badge>{session.recommended_level}</Badge>
            )}
            {(session.tags ?? []).slice(0, 6).map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/motionexpert/occ/${occ.id}/checkin`}
            className="inline-flex items-center rounded-md bg-yuvi-skyblue px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Zum Check-in
          </Link>
        </div>
      </div>

      {/* Media */}
      {(sessionImages.length > 0 ||
        (location && (location.image_urls?.length ?? 0) > 0)) && (
        <div className="grid grid-cols-2 gap-3">
          {sessionImages.slice(0, 4).map((src, i) => (
            <div
              key={`s-${i}`}
              className="relative aspect-[16/9] overflow-hidden rounded-xl border bg-white"
            >
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          ))}
          {(location?.image_urls ?? []).slice(0, 2).map((src, i) => (
            <div
              key={`l-${i}`}
              className="relative aspect-[16/9] overflow-hidden rounded-xl border bg-white"
            >
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Beschreibung</h2>
          <p className="whitespace-pre-wrap text-slate-700">
            {session.description || "Keine Beschreibung hinterlegt."}
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-600">
                Ausrüstung
              </h3>
              <p className="text-sm text-slate-700">
                {(session.equipment ?? []).join(", ") || "—"}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-600">
                Preis
              </h3>
              <p className="text-sm text-slate-700">
                {euro(session.price_cents)}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-600">
                Start
              </h3>
              <p className="text-sm text-slate-700">
                {new Date(occ.starts_at).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-600">
                Ende
              </h3>
              <p className="text-sm text-slate-700">
                {new Date(occ.ends_at).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-600">
                Kapazität
              </h3>
              <p className="text-sm text-slate-700">{occ.capacity}</p>
            </div>
            {location && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-600">
                  Location
                </h3>
                <p className="text-sm text-slate-700">
                  {(location as any).title || "—"}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-lg font-semibold">Teilnehmer</h2>
          <div className="text-sm text-slate-600 mb-2">
            Eingecheckt: {checkedIn.length} • Erwartet: {expected.length}
          </div>
          <div className="max-h-72 overflow-auto space-y-2 pr-1">
            {bookings.length === 0 && (
              <p className="text-sm text-slate-500">Keine Buchungen.</p>
            )}
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-100">
                    <Image
                      src={b.avatar_url ?? "/avatar.png"}
                      alt={b.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-slate-500">
                      {b.checked_in_at
                        ? new Date(b.checked_in_at).toLocaleTimeString()
                        : b.status === "pending"
                        ? "Reserviert"
                        : "Bestätigt"}
                    </div>
                  </div>
                </div>
                <span
                  className={
                    "text-xs rounded-full px-2 py-0.5 ring-1 " +
                    (b.payment === "paid"
                      ? "bg-green-50 text-green-700 ring-green-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200")
                  }
                >
                  {b.payment === "paid" ? "Bezahlt" : "Offen"}
                </span>
              </div>
            ))}
          </div>
          <Link
            href={`/dashboard/motionexpert/occ/${occ.id}/checkin`}
            className="mt-3 inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            Check-in öffnen
          </Link>
        </Card>
      </div>

      {/* Edit Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session bearbeiten */}
        <Card className="p-4">
          <h2 className="mb-3 text-lg font-semibold">Session bearbeiten</h2>

          {/* BILDER: Upload + Preview + Speichern */}
          <SessionImagesEditor
            sessionId={session.id}
            initialKeys={session.image_urls ?? []}
            persistAction={updateSessionImagesAction}
            className="mb-6"
          />

          <form action={updateSessionAction} className="space-y-3">
            <input type="hidden" name="session_id" value={session.id} />
            {/* wichtig für korrektes Revalidate der Detailseite */}
            <input type="hidden" name="occurrence_id" value={occ.id} />

            <label className="block text-sm">
              <span className="text-slate-700">Titel</span>
              <Input
                name="title"
                defaultValue={session.title}
                required
                className="mt-1"
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-700">Beschreibung</span>
              <Textarea
                name="description"
                defaultValue={session.description ?? ""}
                className="mt-1 min-h-24"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-slate-700">Preis (EUR)</span>
                <Input
                  name="price_eur"
                  type="number"
                  step="0.01"
                  defaultValue={(session.price_cents / 100).toFixed(2)}
                  className="mt-1"
                />
              </label>
              <label className="block text-sm">
                <span className="text-slate-700">Level</span>
                <Input
                  name="recommended_level"
                  defaultValue={session.recommended_level ?? ""}
                  className="mt-1"
                />
              </label>
            </div>

            <label className="block text-sm">
              <span className="text-slate-700">Tags (kommagetrennt)</span>
              <Input
                name="tags"
                defaultValue={(session.tags ?? []).join(", ")}
                className="mt-1"
              />
            </label>

            {/* EQUIPMENT: Chips */}
            <ChipInput
              name="equipment_json"
              label="Equipment"
              defaultValues={session.equipment ?? []}
              suggestions={[
                "Matte",
                "Kurzhanteln",
                "Kettlebell",
                "Widerstandsband",
                "TRX",
                "Boxsack",
                "Stepper",
                "Medizinball",
              ]}
              className="mt-2"
            />

            <div className="pt-2">
              <Button type="submit">Session speichern</Button>
            </div>
          </form>
        </Card>

        {/* Occurrence bearbeiten */}
        <Card className="p-4">
          <h2 className="mb-3 text-lg font-semibold">
            Termin (Occurrence) bearbeiten
          </h2>
          <form action={updateOccurrenceAction} className="space-y-3">
            <input type="hidden" name="occurrence_id" value={occ.id} />
            <label className="block text-sm">
              <span className="text-slate-700">Start (lokal)</span>
              <Input
                type="datetime-local"
                name="starts_at"
                defaultValue={toLocalInputValue(occ.starts_at)}
                className="mt-1"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-700">Ende (lokal)</span>
              <Input
                type="datetime-local"
                name="ends_at"
                defaultValue={toLocalInputValue(occ.ends_at)}
                className="mt-1"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-700">Kapazität</span>
              <Input
                type="number"
                name="capacity"
                defaultValue={occ.capacity}
                className="mt-1"
              />
            </label>

            <div className="pt-2">
              <Button type="submit" variant="secondary">
                Termin speichern
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

//TODO: OCCs und Sessions machen gerade keinen Sinn weil ich alles zentral verwalten will.
//TODO: Was passiert wenn eine Session abgesagt wird? Müssen alle OCCs gelöscht werden?

//TODO: OCCs und Sessions machen gerade keinen sinn weil ich alles zentral verwalten will.
//TODO: Was passiert wenn eine Session abgesagt wird? Müssen alle OCCs gelöscht werden?
//TODO: INFO CHIPS für STATUS (z.B. voll, fast voll, offen etc) und alle anderen müssen vereinheitlicht werden
