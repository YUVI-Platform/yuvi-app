// src/app/(protected)/dashboard/studioHost/locations/new/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServerRead, supabaseServerAction } from "@/lib/supabaseServer";
import AmenitiesPicker from "./ui/AmenitiesPicker";
import TagsPicker from "./ui/TagsPicker";
import ImageMultiUpload from "./ui/ImageMultiUpload";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { TablesInsert } from "@/types/supabase";

// fixe Optionen (MVP, zentral gepflegt) – NICHT exportieren!
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
];

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
];

// JSON-String -> string[] (fail-safe)
const jsonArray = z.string().transform((s) => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
});

const schema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(2000).optional().default(""),

  street: z.string().min(2).max(160),
  zip: z.string().min(2).max(20),
  city: z.string().min(2).max(120),
  country: z.string().min(2).max(80),

  area_sqm: z.coerce.number().int().min(1).max(100000).optional(),
  max_participants: z.coerce.number().int().min(1).max(5000),

  amenities_json: jsonArray,
  allowed_tags_json: jsonArray,
  image_urls_json: jsonArray,

  house_rules: z.string().max(4000).optional().default(""),
  is_draft: z.coerce.boolean().optional().default(true),
});

export default async function NewLocationPage() {
  // Session & Rolle
  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user)
    redirect("/login?redirectTo=/dashboard/studiohost/locations/new");
  const uid = me.user.id;

  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);
  const isStudioHost = !!roles?.some(
    (r) => r.role === "studioHost" || r.role === "admin"
  );
  if (!isStudioHost) redirect("/dashboard");

  // Server Action
  // Server Action
  async function createLocation(formData: FormData): Promise<void> {
    "use server";

    const parsed = schema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),

      street: formData.get("street"),
      zip: formData.get("zip"),
      city: formData.get("city"),
      country: formData.get("country"),

      area_sqm: formData.get("area_sqm"),
      max_participants: formData.get("max_participants"),

      amenities_json: formData.get("amenities_json") ?? "[]",
      allowed_tags_json: formData.get("allowed_tags_json") ?? "[]",
      image_urls_json: formData.get("image_urls_json") ?? "[]",

      house_rules: formData.get("house_rules"),
      is_draft: formData.get("is_draft") ? true : false,
    });
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }
    const v = parsed.data;

    const address = {
      street: v.street,
      zip: v.zip,
      city: v.city,
      country: v.country,
    };

    const supaWrite = await supabaseServerAction();
    const { data: userData } = await supaWrite.auth.getUser();
    const currentUid = userData.user?.id;
    if (!currentUid) {
      redirect("/login?redirectTo=/dashboard/studiohost/locations/new");
    }

    // Insert-Payload strikt typisieren, damit der richtige Overload greift
    const payload: TablesInsert<"studio_locations"> = {
      host_user_id: currentUid, // required string ✅
      owner_user_id: currentUid, // optional, aber ok
      title: v.title, // required string ✅
      address, // required Json ✅
      description: v.description || null,
      area_sqm: v.area_sqm ?? null,
      max_participants: v.max_participants, // required number ✅
      amenities: v.amenities_json.length ? v.amenities_json : null,
      allowed_tags: v.allowed_tags_json.length ? v.allowed_tags_json : null,
      image_urls: v.image_urls_json.length ? v.image_urls_json : null,
      house_rules: v.house_rules || null,
      is_draft: v.is_draft ?? true,
      // price_per_slot kannst du später setzen, ist optional
    };

    const { error } = await supaWrite.from("studio_locations").insert(payload);
    if (error) throw new Error(error.message);

    redirect("/dashboard/studiohost");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Neue Location</h1>
      <p className="text-sm text-slate-600 mb-6">
        Lege eine Location an. Bilder & Slots kannst du später ergänzen.
      </p>

      <form action={createLocation} className="space-y-6">
        {/* Basis */}
        <section className="rounded-xl border bg-white p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Titel</label>
            <input
              name="title"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Beschreibung</label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </section>

        {/* Adresse */}
        <section className="rounded-xl border bg-white p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Straße & Nr.</label>
            <input
              name="street"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">PLZ</label>
            <input
              name="zip"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Stadt</label>
            <input
              name="city"
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Land</label>
            <input
              name="country"
              required
              defaultValue="Deutschland"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </section>

        {/* Kapazität / Fläche / Regeln */}
        <section className="rounded-xl border bg-white p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Max. Teilnehmer</label>
            <input
              name="max_participants"
              type="number"
              min={1}
              required
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Fläche (m²)</label>
            <input
              name="area_sqm"
              type="number"
              min={1}
              className="w-full rounded-md border px-3 py-2"
              placeholder="optional"
            />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-sm font-medium">Hausregeln (optional)</label>
            <textarea
              name="house_rules"
              rows={3}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </section>

        {/* Ausstattungen / Tags / Bilder */}
        <section className="rounded-xl border bg-white p-5 space-y-6">
          <AmenitiesPicker name="amenities_json" options={AMENITIES_OPTIONS} />
          <TagsPicker name="allowed_tags_json" options={TAG_OPTIONS} />
          <ImageMultiUpload
            name="image_urls_json"
            bucket="studio-images"
            pathPrefix="locations"
            label="Bilder hochladen"
          />
        </section>

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_draft" defaultChecked />
          <span>Als Entwurf speichern</span>
        </label>

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
            Anlegen
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
