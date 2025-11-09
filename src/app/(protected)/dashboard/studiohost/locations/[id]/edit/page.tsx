// src/app/(protected)/dashboard/studioHost/locations/[id]/edit/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServerRead } from "@/lib/supabaseServer";
import { updateLocation, deleteLocation, toggleDraft } from "../../actions";
import AmenitiesPicker from "../../new/ui/AmenitiesPicker";
import TagsPicker from "../../new/ui/TagsPicker";
import ImageMultiUploadEdit from "./ui/ImageMultiUploadEdit";
import { SubmitButton } from "@/components/ui/SubmitButton";
import DeleteWithConfirm from "./ui/DeleteWithConfirm";

/* ===================== Types ===================== */
type Address = {
  street: string;
  zip: string;
  city: string;
  country: string;
};

type LocationRow = {
  id: string;
  title: string | null;
  description: string | null;
  address: Address | null;
  image_urls: string[] | null;
  amenities: string[] | null;
  allowed_tags: string[] | null;
  max_participants: number | null;
  area_sqm: number | null;
  house_rules: string | null;
  is_draft: boolean | null;
  owner_user_id: string;
  host_user_id: string | null;
  /** 🆕 in Cents in der DB */
  price_per_slot: number | null;
};

/* ===================== Optionen ===================== */
const AMENITIES_OPTIONS = [
  "WLAN",
  "Toiletten",
  "Umkleiden",
  "Duschen",
  "Spinde",
  "Parkplätze",
  "Fahrradständer",
  "Barrierefrei",
  "Trinkwasser",
  "Klimaanlage",
] as const;

const TAG_OPTIONS = [
  "Yoga",
  "HIIT",
  "Mobility",
  "Krafttraining",
  "Pilates",
  "CrossFit",
  "Boxen",
  "Tanzen",
  "Calisthenics",
  "Functional",
] as const;

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user)
    redirect(`/login?redirectTo=/dashboard/studiohost/locations/${id}/edit`);
  const uid = me.user.id;

  const { data: loc, error } = await supa
    .from("studio_locations")
    .select<
      // Spaltenliste + zugehöriger Row-Typ
      "id,title,description,address,image_urls,amenities,allowed_tags,max_participants,area_sqm,house_rules,is_draft,owner_user_id,host_user_id,price_per_slot",
      LocationRow
    >(
      "id,title,description,address,image_urls,amenities,allowed_tags,max_participants,area_sqm,house_rules,is_draft,owner_user_id,host_user_id,price_per_slot"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !loc) redirect("/dashboard/studiohost/locations");
  const canEdit = loc.owner_user_id === uid || loc.host_user_id === uid;
  if (!canEdit) redirect("/dashboard/studiohost/locations");

  const addr: Address = loc.address ?? {
    street: "",
    zip: "",
    city: "",
    country: "Deutschland",
  };
  const initialAmenities: string[] = loc.amenities ?? [];
  const initialTags: string[] = loc.allowed_tags ?? [];
  const initialImages: string[] = loc.image_urls ?? [];

  // 🧮 EUR-String für defaultValue
  const priceEurDefault =
    typeof loc.price_per_slot === "number" && loc.price_per_slot >= 0
      ? (loc.price_per_slot / 100).toFixed(2)
      : "";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Location bearbeiten</h1>
          <p className="text-sm text-slate-600">{loc.title ?? "Ohne Titel"}</p>
        </div>

        <div className="flex gap-2">
          {/* Draft / Live */}
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

          {/* Delete mit Client-Bestätigung */}
          <DeleteWithConfirm id={loc.id} action={deleteLocation} />
        </div>
      </div>

      {/* EDIT FORM */}
      <form action={updateLocation} className="space-y-6">
        <input type="hidden" name="id" value={loc.id} />

        <section className="rounded-xl border bg-white p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Titel</label>
            <input
              name="title"
              required
              defaultValue={loc.title ?? ""}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Beschreibung</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={loc.description ?? ""}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium">Straße & Nr.</label>
            <input
              name="street"
              required
              defaultValue={addr.street}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">PLZ</label>
            <input
              name="zip"
              required
              defaultValue={addr.zip}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Stadt</label>
            <input
              name="city"
              required
              defaultValue={addr.city}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium">Land</label>
            <input
              name="country"
              required
              defaultValue={addr.country}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Max. Teilnehmer</label>
            <input
              name="max_participants"
              type="number"
              min={1}
              required
              defaultValue={loc.max_participants ?? 10}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Fläche (m²)</label>
            <input
              name="area_sqm"
              type="number"
              min={1}
              defaultValue={loc.area_sqm ?? ""}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          {/* 🆕 Preis pro Slot (EUR) */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium">Preis pro Slot (EUR)</label>
            <input
              name="price_per_slot_eur"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              defaultValue={priceEurDefault}
              placeholder="z. B. 25.00"
              className="w-full rounded-md border px-3 py-2"
            />
            <p className="text-xs text-slate-500">
              Intern in Cent gespeichert. Leer lassen für keinen festen
              Slot-Preis.
            </p>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium">Hausregeln (optional)</label>
            <textarea
              name="house_rules"
              rows={3}
              defaultValue={loc.house_rules ?? ""}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </section>

        <section className="space-y-6 rounded-xl border bg-white p-5">
          <AmenitiesPicker
            name="amenities_json"
            options={[...AMENITIES_OPTIONS]}
            defaultSelected={initialAmenities}
          />
          <TagsPicker
            name="allowed_tags_json"
            options={[...TAG_OPTIONS]}
            defaultSelected={initialTags}
          />
          <ImageMultiUploadEdit
            name="image_urls_json"
            bucket="studio-images"
            pathPrefix={`locations/${loc.id}`}
            label="Bilder"
            initialUrls={initialImages}
          />
        </section>

        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/studiohost/locations"
            className="rounded-md border px-4 py-2"
          >
            Abbrechen
          </Link>
          <SubmitButton
            className="rounded-md bg-black px-4 py-2 text-white"
            pendingText="Speichern…"
          >
            Änderungen speichern
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
