// src/app/dashboard/studiohost/locations/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { z } from "zod";

export async function toggleDraft(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const nextDraft = String(formData.get("next_draft") ?? "") === "true";
  if (!id) throw new Error("Missing id");

  const supa = await supabaseServerAction();
  const { error } = await supa
    .from("studio_locations")
    .update({ is_draft: nextDraft })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/studiohost/locations");
}

const jsonArray = z.string().transform((s) => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
});

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(160),
  description: z.string().max(2000).optional().default(""),

  street: z.string().min(2).max(160),
  zip: z.string().min(2).max(20),
  city: z.string().min(2).max(120),
  country: z.string().min(2).max(80),

  area_sqm: z.coerce.number().int().min(1).max(100000).optional().nullable(),
  max_participants: z.coerce.number().int().min(1).max(5000),

  amenities_json: jsonArray,
  allowed_tags_json: jsonArray,
  image_urls_json: jsonArray,

  house_rules: z.string().max(4000).optional().default(""),
});

export async function updateLocation(formData: FormData): Promise<void> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
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

  const supa = await supabaseServerAction();
  const { error } = await supa
    .from("studio_locations")
    .update({
      title: v.title,
      description: v.description || null,
      address,
      area_sqm: v.area_sqm ?? null,
      max_participants: v.max_participants,
      amenities: v.amenities_json.length ? v.amenities_json : null,
      allowed_tags: v.allowed_tags_json.length ? v.allowed_tags_json : null,
      image_urls: v.image_urls_json.length ? v.image_urls_json : null,
      house_rules: v.house_rules || null,
    })
    .eq("id", v.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/studiohost/locations");
  // kein Return – Server Actions in <form action={...}> müssen void liefern
}

export async function deleteLocation(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  const supa = await supabaseServerAction();
  const { error } = await supa.from("studio_locations").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/studiohost/locations");
}
