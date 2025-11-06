"use server";

import type { TablesInsert } from "@/types/supabase";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

/* ---------- Helpers ---------- */

// TODO: später echte Ownership/RLS prüfen
async function ensureOwner(location_id: string) {
  if (!location_id) throw new Error("location_id missing");
  return;
}

/** 'YYYY-MM-DDTHH:mm' -> Date (lokale TZ) */
function localDateTimeToDate(s: string) {
  const d = new Date(s);
  if (Number.isNaN(+d)) throw new Error("Ungültiges Datum");
  return d;
}

type SlotInsert = TablesInsert<"studio_slots">;

async function getDefaults(location_id: string) {
  const { data, error } = await supabaseAdmin
    .from("studio_locations")
    .select("max_participants, allowed_tags, price_per_slot")
    .eq("id", location_id)
    .maybeSingle();

  if (error || !data)
    throw new Error(error?.message || "Location nicht gefunden");

  return {
    capacity: data.max_participants ?? 0,
    allowed_tags: data.allowed_tags ?? [],
    price_per_slot: data.price_per_slot ?? null, // nur Info; nicht in Slot schreiben
  };
}

/* ---------- Einzel-Slot ---------- */

export async function createSingleSlot(formData: FormData) {
  const location_id = String(formData.get("location_id") ?? "");
  const starts_raw = String(formData.get("starts_at") ?? "");
  await ensureOwner(location_id);

  const start = localDateTimeToDate(starts_raw);
  const end = new Date(+start + 60 * 60 * 1000); // 60 Min

  const defs = await getDefaults(location_id);

  const row: SlotInsert = {
    location_id,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    capacity: defs.capacity,
    allowed_tags: defs.allowed_tags?.length ? defs.allowed_tags : null,
    status: "available",
  };

  const { error } = await supabaseAdmin.from("studio_slots").insert(row);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/studiohost/locations/${location_id}/slots`);
  revalidatePath(`/dashboard/studiohost/locations/${location_id}`);
  return { ok: true as const };
}

/* ---------- Wiederkehrende Slots ---------- */

const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/; // "2025-11-04T09:00"
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/; // "2025-11-30"

const recurSchema = z
  .object({
    location_id: z.string().uuid(),
    first_starts_at: z
      .string()
      .regex(DATETIME_LOCAL, "Invalid datetime-local (YYYY-MM-DDTHH:mm)"),
    byweekday: z
      .array(z.enum(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]))
      .min(1, "Mind. ein Wochentag"),
    until_date: z
      .string()
      .regex(DATE_ONLY, "Invalid date (YYYY-MM-DD)")
      .optional(),
    count: z.coerce.number().int().min(1).max(200).optional(),
  })
  .refine((d) => d.until_date || d.count, {
    message: "Entweder Enddatum oder Anzahl angeben.",
  });

const WD: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};
const weekdayToNum = (w: string) => WD[w] ?? -1;

export async function createRecurringSlots(formData: FormData) {
  const location_id = String(formData.get("location_id") ?? "");
  const first_starts_at = String(formData.get("first_starts_at") ?? "");
  const until_date = String(formData.get("until_date") ?? "");
  const countRaw = formData.get("count");
  const byweekday = formData.getAll("byweekday").map(String);

  // Default: wenn kein Enddatum → 12 Vorkommen
  const countNormalized =
    (countRaw ? Number(countRaw) : undefined) ?? (!until_date ? 12 : undefined);

  const parsed = recurSchema.parse({
    location_id,
    first_starts_at,
    until_date: until_date || undefined,
    count: countNormalized,
    byweekday,
  });

  await ensureOwner(parsed.location_id);
  const defs = await getDefaults(parsed.location_id);

  const firstStart = localDateTimeToDate(parsed.first_starts_at);
  const durMs = 60 * 60 * 1000; // 60 Min
  const endDate = parsed.until_date
    ? new Date(parsed.until_date + "T23:59:59")
    : null;
  const maxCount = parsed.count ?? 200;

  const wdSet = new Set(parsed.byweekday.map(weekdayToNum));
  const baseHour = firstStart.getHours();
  const baseMin = firstStart.getMinutes();

  const cursor = new Date(
    firstStart.getFullYear(),
    firstStart.getMonth(),
    firstStart.getDate(),
    0,
    0,
    0,
    0
  );

  const rows: SlotInsert[] = [];
  let produced = 0;

  while (produced < maxCount) {
    if (endDate) {
      const dayOnly = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        cursor.getDate()
      );
      const endOnly = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      if (+dayOnly > +endOnly) break;
    }
    const dow = cursor.getDay();
    if (wdSet.has(dow)) {
      const start = new Date(cursor);
      start.setHours(baseHour, baseMin, 0, 0);
      if (+start >= +firstStart) {
        const end = new Date(+start + durMs);
        rows.push({
          location_id: parsed.location_id,
          starts_at: start.toISOString(),
          ends_at: end.toISOString(),
          capacity: defs.capacity,
          allowed_tags: defs.allowed_tags?.length ? defs.allowed_tags : null,
          status: "available",
        });
        produced++;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
    if (!endDate && produced >= maxCount) break;
    if (rows.length > 1000) break; // einfache Kappung
  }

  let ok = 0,
    skipped = 0;
  for (const row of rows) {
    const { error } = await supabaseAdmin.from("studio_slots").insert(row);
    if (error) {
      // Falls du einen "no_overlap" Constraint hast
      if (error.message?.toLowerCase().includes("no_overlap")) {
        skipped++;
        continue;
      }
      throw new Error(error.message);
    }
    ok++;
  }

  revalidatePath(`/dashboard/studiohost/locations/${parsed.location_id}/slots`);
  revalidatePath(`/dashboard/studiohost/locations/${parsed.location_id}`);
  return { ok: true as const, created: ok, skipped };
}

/* ---------- Mutationen für bestehende Slots ---------- */

export async function deleteSlot(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const location_id = String(formData.get("location_id") ?? "");
  const { error } = await supabaseAdmin
    .from("studio_slots")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/studiohost/locations/${location_id}/slots`);
  return { ok: true as const };
}

export async function setBlocked(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const location_id = String(formData.get("location_id") ?? "");
  const blocked = String(formData.get("blocked") ?? "false") === "true";
  const { error } = await supabaseAdmin
    .from("studio_slots")
    .update({ status: blocked ? "blocked" : "available" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/studiohost/locations/${location_id}/slots`);
  return { ok: true as const };
}
