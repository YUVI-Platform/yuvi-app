import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { toggleDraft } from "../actions";
import Gallery from "./ui/Gallery";
import clsx from "clsx";

type Address = {
  street?: string;
  zip?: string;
  city?: string;
  country?: string;
};

type SlotRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity: number | null;
  status: "available" | "blocked" | "reserved" | string;
  allowed_tags: string[] | null;
};

export default async function LocationPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next 15: async params

  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user)
    redirect(`/login?redirectTo=/dashboard/studioHost/locations/${id}`);
  const uid = me.user.id;

  // Location laden
  const { data: loc, error } = await supa
    .from("studio_locations")
    .select(
      "id,title,description,address,image_urls,amenities,allowed_tags,max_participants,area_sqm,house_rules,verification,is_draft,owner_user_id,host_user_id,updated_at,price_per_slot"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !loc) redirect("/dashboard/studioHost/locations");

  const tagList: string[] = Array.isArray(loc.allowed_tags)
    ? (loc.allowed_tags as string[])
    : [];

  // Sichtbarkeit im Dashboard nur für Owner/Host
  const canView = loc.owner_user_id === uid || loc.host_user_id === uid;
  if (!canView) redirect("/dashboard/studioHost/locations");

  // ✅ kein any
  const addr: Address =
    typeof loc.address === "object" && loc.address !== null
      ? (loc.address as Address)
      : {};
  const imgs: string[] = Array.isArray(loc.image_urls) ? loc.image_urls : [];

  // Nächste Slots (nur Zukunft)
  const nowISO = new Date().toISOString();
  const { data: slotsRaw, error: slotsErr } = await supa
    .from("studio_slots")
    .select("id, starts_at, ends_at, capacity, status, allowed_tags")
    .eq("location_id", id)
    .gte("starts_at", nowISO)
    .neq("status", "blocked") // optional
    .order("starts_at", { ascending: true })
    .limit(20);

  if (slotsErr) {
    console.warn("slots query error:", slotsErr.message);
  }
  const slots: SlotRow[] = (slotsRaw ?? []) as SlotRow[];

  return (
    <div className="mx-auto max-w-6xl py-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {loc.title ?? "Ohne Titel"}
          </h1>
          <p className="text-sm text-slate-600">
            {addr.street ? `${addr.street}, ` : ""}
            {addr.zip ? `${addr.zip} ` : ""}
            {addr.city ?? ""}
            {addr.country ? `, ${addr.country}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Publish/Unpublish */}
          <form action={toggleDraft}>
            <input type="hidden" name="id" value={loc.id} />
            <input
              type="hidden"
              name="next_draft"
              value={(!loc.is_draft).toString()}
            />
            <SubmitButton className="rounded-md border px-3 py-2 text-sm">
              {loc.is_draft ? "Veröffentlichen" : "Als Entwurf"}
            </SubmitButton>
          </form>

          <Link
            href={`/dashboard/studioHost/locations/${loc.id}/edit`}
            className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
          >
            Bearbeiten
          </Link>
          <Link
            href={`/dashboard/studioHost/locations/${loc.id}/slots`}
            className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-black/90"
          >
            Slots verwalten
          </Link>
        </div>
      </div>

      {/* Gallery */}
      <div className="mb-6 overflow-hidden rounded-xl ring-1 ring-black/5">
        <Gallery images={imgs} />
      </div>

      {/* Meta-Kacheln */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetaBox
          label="Status"
          value={loc.is_draft ? "Entwurf" : "Live"}
          tone={loc.is_draft ? "slate" : "emerald"}
        />
        <MetaBox
          label="Kapazität"
          value={
            typeof loc.max_participants === "number"
              ? `${loc.max_participants} Personen`
              : "—"
          }
        />
        <MetaBox
          label="Fläche"
          value={typeof loc.area_sqm === "number" ? `${loc.area_sqm} m²` : "—"}
        />
      </div>

      {/* Tags & Amenities */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardSection title="Tags">
          <Chips
            items={tagList.map((t: string) => `#${t}`)} // ✅ kein implizites any
            empty="Keine Tags"
            tone="emerald"
          />
        </CardSection>
        <CardSection title="Ausstattung">
          <Chips
            items={loc.amenities ?? []}
            empty="Keine Angaben"
            tone="indigo"
          />
        </CardSection>
      </div>

      {/* Beschreibung & Hausregeln */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardSection title="Beschreibung">
          <p className="whitespace-pre-wrap text-slate-700">
            {loc.description?.trim() || "—"}
          </p>
        </CardSection>
        <CardSection title="Hausregeln">
          <p className="whitespace-pre-wrap text-slate-700">
            {loc.house_rules?.trim() || "—"}
          </p>
        </CardSection>
      </div>

      {/* Kommende Slots */}
      <CardSection title="Kommende Slots">
        {!slots.length ? (
          <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span className="text-slate-600">
              Noch keine zukünftigen Slots.
            </span>
            <Link
              href={`/dashboard/studioHost/locations/${loc.id}/slots`}
              className="rounded-md bg-black px-3 py-1.5 text-white hover:bg-black/90"
            >
              Slots anlegen
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {slots.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-12 sm:items-center"
              >
                <div className="sm:col-span-5">
                  <p className="font-medium">
                    {formatDateTime(s.starts_at)} – {formatTime(s.ends_at)}
                  </p>
                </div>
                <div className="sm:col-span-3 text-sm text-slate-600">
                  Kapazität: <b>{s.capacity}</b> • Preis:{" "}
                  {formatEuro(loc.price_per_slot)}
                </div>
                <div className="sm:col-span-3">
                  <Chips
                    items={
                      Array.isArray(s.allowed_tags)
                        ? s.allowed_tags.map((t) => `#${t}`)
                        : []
                    }
                    empty="alle Tags"
                    tone="slate"
                  />
                </div>
                <div className="sm:col-span-1 flex sm:justify-end">
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
            <div className="pt-3">
              <Link
                href={`/dashboard/studioHost/locations/${loc.id}/slots`}
                className="text-sm text-slate-600 underline"
              >
                Alle Slots verwalten
              </Link>
            </div>
          </div>
        )}
      </CardSection>

      {/* Footer-Nav */}
      <div className="mt-8 flex justify-between">
        {/* ✅ Link statt <a> */}
        <Link
          href="/dashboard/studioHost/locations"
          className="text-sm text-slate-600 underline"
        >
          Zurück zur Übersicht
        </Link>
        {loc.updated_at && (
          <p className="text-sm text-slate-500">
            Zuletzt aktualisiert: {new Date(loc.updated_at).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Kleine UI-Helfer ---------- */

function MetaBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "slate" | "emerald";
}) {
  const badge =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={clsx(
          "mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-sm ring-1 ring-inset",
          badge
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-5">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">{title}</h2>
      {children}
    </section>
  );
}

function Chips({
  items,
  empty,
  tone = "slate",
}: {
  items: string[];
  empty: string;
  tone?: "slate" | "emerald" | "indigo";
}) {
  const cls =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tone === "indigo"
      ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
  if (!items.length) {
    return <span className="text-sm text-slate-500">{empty}</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span
          key={t}
          className={clsx(
            "rounded-full px-2.5 py-1 text-xs ring-1 ring-inset",
            cls
          )}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    blocked: "bg-rose-50 text-rose-700 ring-rose-200",
    reserved: "bg-amber-50 text-amber-700 ring-amber-200",
  };
  const cls = map[status] || "bg-slate-50 text-slate-700 ring-slate-200";
  const label =
    status === "available"
      ? "Verfügbar"
      : status === "blocked"
      ? "Blockiert"
      : status === "reserved"
      ? "Reserviert"
      : status;
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs ring-1 ring-inset",
        cls
      )}
    >
      {label}
    </span>
  );
}

/* ---------- Format-Helper ---------- */
function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}
function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString();
}
function formatEuro(cents?: number | null) {
  if (cents == null) return "—";
  return `${(cents / 100).toFixed(2)}€`;
}
