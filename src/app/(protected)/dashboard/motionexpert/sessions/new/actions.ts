// src/app/(protected)/dashboard/motionexpert/sessions/new/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServerAction, supabaseServerRead } from "@/lib/supabaseServer";
import type {
  SessionInsert,
  SessionOccurrenceInsert,
  StudioSlotRow,
  SessionTypeEnum,
  LocationTypeEnum,
} from "@/types/db-helpers";
import { Constants } from "@/types/supabase";

// Enums
const SESSION_TYPES = Constants.public.Enums.session_type as readonly [
  SessionTypeEnum,
  ...SessionTypeEnum[]
];
const LOCATION_TYPES = Constants.public.Enums.location_type as readonly [
  LocationTypeEnum,
  ...LocationTypeEnum[]
];

// Falls du ein DB-Enum hast (z.B. public.enum: fitness_level), nutz es hier.
// Sonst fallback auf Literal-Union:
const FITNESS_LEVELS = ["beginner", "intermediate", "advanced"] as const;

// Client->Server Payload (transport)
const PublishPayload = z.object({
  session: z.object({
    session_type: z.enum(SESSION_TYPES),
    location_type: z.enum(LOCATION_TYPES),
    title: z.string().min(3).max(160),
    description: z.string().max(4000).optional().default(""),
    duration_minutes: z.number().int().min(1).max(10000),
    max_participants: z.number().int().positive().optional(),
    price_cents: z.number().int().min(0).optional(),
    tags: z.array(z.string()).max(50).optional().default([]),
    image_urls: z.array(z.string().url()).max(12).optional().default([]),
    equipment: z.array(z.string()).max(50).optional().default([]),
    is_draft: z.boolean().optional().default(false),
    // ✅ NEU: empfohlenes Fitnesslevel
    recommended_level: z.enum(FITNESS_LEVELS).optional().nullable(),
  }),
  studioSlotIds: z.array(z.string().uuid()).optional().default([]),
});

export async function publishSessions(formData: FormData) {
  const raw = String(formData.get("payload") ?? "");
  let parsed: z.infer<typeof PublishPayload>;
  try {
    parsed = PublishPayload.parse(JSON.parse(raw));
  } catch {
    throw new Error("Ungültige Formulardaten.");
  }

  const supaWrite = await supabaseServerAction();
  const { data: me } = await supaWrite.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) redirect("/login?redirectTo=/dashboard/motionexpert/sessions/new");

  let fallbackMax: number | undefined;
  let fallbackPrice: number | undefined;

  if (
    parsed.session.location_type === "studio_location" &&
    parsed.studioSlotIds.length > 0
  ) {
    const supaRead = await supabaseServerRead();

    // Slots lesen
    const { data: slots, error: slotsErr } = await supaRead
      .from("studio_slots")
      .select("id, capacity, starts_at, ends_at, location_id")
      .in("id", parsed.studioSlotIds);

    if (slotsErr) throw new Error(slotsErr.message);
    const firstSlot = (slots ?? [])[0] as StudioSlotRow | undefined;
    if (!firstSlot) throw new Error("Keine gültigen Slots gefunden.");

    // Location lesen
    const { data: loc, error: locErr } = await supaRead
      .from("studio_locations")
      .select("max_participants, price_per_slot")
      .eq("id", firstSlot.location_id)
      .maybeSingle();

    if (locErr) throw new Error(locErr.message);
    if (loc) {
      if (typeof loc.max_participants === "number")
        fallbackMax = loc.max_participants;
      if (typeof loc.price_per_slot === "number")
        fallbackPrice = loc.price_per_slot;
    }

    if (!fallbackMax && firstSlot.capacity) fallbackMax = firstSlot.capacity;
  }

  const max_participants = parsed.session.max_participants ?? fallbackMax ?? 1;
  const price_cents = parsed.session.price_cents ?? fallbackPrice ?? 0;

  const sessionInsert: SessionInsert = {
    expert_user_id: uid,
    session_type: parsed.session.session_type,
    location_type: parsed.session.location_type,
    title: parsed.session.title.trim(),
    description: parsed.session.description?.trim() || null,
    duration_minutes: parsed.session.duration_minutes,
    max_participants,
    price_cents,
    tags:
      parsed.session.tags && parsed.session.tags.length
        ? parsed.session.tags
        : null,
    image_urls:
      parsed.session.image_urls && parsed.session.image_urls.length
        ? parsed.session.image_urls
        : null,
    equipment:
      parsed.session.equipment && parsed.session.equipment.length
        ? parsed.session.equipment
        : null,
    is_draft: parsed.session.is_draft ?? false,
    preparation_minutes: null,
    // ✅ NEU: Wert aus Payload in die DB schreiben
    recommended_level: parsed.session.recommended_level ?? null,
  };

  // Session anlegen
  const { data: newSession, error: insErr } = await supaWrite
    .from("sessions")
    .insert(sessionInsert)
    .select("id")
    .maybeSingle();

  if (insErr) throw new Error(insErr.message);
  if (!newSession?.id) throw new Error("Session konnte nicht erstellt werden.");

  // Occurrences für Studio-Slots
  if (
    parsed.session.location_type === "studio_location" &&
    parsed.studioSlotIds.length > 0
  ) {
    const supaRead = await supabaseServerRead();
    const { data: slots, error: slotsErr } = await supaRead
      .from("studio_slots")
      .select("id, starts_at, ends_at, capacity")
      .in("id", parsed.studioSlotIds);

    if (slotsErr) throw new Error(slotsErr.message);

    const occurrences: SessionOccurrenceInsert[] = (slots ?? []).map((s) => ({
      session_id: newSession.id,
      studio_slot_id: s.id,
      self_hosted_slot_id: null,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      capacity: s.capacity ?? max_participants,
    }));

    const { error: occErr } = await supaWrite
      .from("session_occurrences")
      .insert(occurrences);

    if (occErr) throw new Error(occErr.message);
  }

  revalidatePath("/dashboard/motionexpert/sessions");
  redirect(`/dashboard/motionexpert/sessions`);
}
