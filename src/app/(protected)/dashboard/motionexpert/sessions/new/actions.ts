// src/app/(protected)/dashboard/motionexpert/sessions/new/actions.ts
"use server";

import { z } from "zod";
import { supabaseServerAction } from "@/lib/supabaseServer";
import type { Database } from "@/types/supabase";

const BaseSessionSchema = z.object({
  session_type: z.enum(["private", "group", "trainWithMe"]),
  location_type: z.enum(["studio_location", "self_hosted"]),
  title: z.string().min(3),
  description: z.string().default(""),
  duration_minutes: z.number().int().positive(),
  max_participants: z.number().int().positive().optional(),
  price_cents: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).max(50).default([]),
  image_urls: z.array(z.string().url()).max(10).default([]),
  equipment: z.array(z.string()).default([]),
  is_draft: z.boolean().default(false),
  recommended_level: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional(),
});

const SessionStudio = BaseSessionSchema.extend({
  location_type: z.literal("studio_location"),
  studio_location_id: z.string().uuid(),
  self_hosted_location_id: z.null().optional(),
});

const SessionSelfHosted = BaseSessionSchema.extend({
  location_type: z.literal("self_hosted"),
  studio_location_id: z.null().optional(),
  self_hosted_location_id: z.string().uuid(),
});

const PayloadSchema = z.object({
  session: z.discriminatedUnion("location_type", [
    SessionStudio,
    SessionSelfHosted,
  ]),
  studioSlotIds: z.array(z.string()).default([]),
});

export async function publishSessions(fd: FormData) {
  const raw = fd.get("payload");
  const parsed = PayloadSchema.safeParse(
    typeof raw === "string" ? JSON.parse(raw) : raw
  );
  if (!parsed.success) throw new Error("Invalid payload");

  const { session, studioSlotIds } = parsed.data;

  const supa = await supabaseServerAction();
  const { data: auth } = await supa.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Unauthenticated");

  // Ableiten, welche Location-Spalte gesetzt wird
  const studio_location_id =
    session.location_type === "studio_location"
      ? session.studio_location_id
      : null;

  const self_hosted_location_id =
    session.location_type === "self_hosted"
      ? session.self_hosted_location_id
      : null;

  // XOR-Check (spiegelt deinen DB-Constraint)
  const locCount =
    (studio_location_id ? 1 : 0) + (self_hosted_location_id ? 1 : 0);
  if (locCount !== 1) throw new Error("sessions_exactly_one_location ...");

  const insertSession: Database["public"]["Tables"]["sessions"]["Insert"] = {
    expert_user_id: uid,
    title: session.title,
    description: session.description,
    duration_minutes: session.duration_minutes,
    equipment: session.equipment,
    image_urls: session.image_urls,
    is_draft: session.is_draft,
    location_type: session.location_type,
    max_participants: session.max_participants ?? 1,
    price_cents: session.price_cents ?? 0,
    recommended_level: session.recommended_level ?? null,
    session_type: session.session_type,
    tags: session.tags,

    // ✅ die beiden DB-Spalten
    studio_location_id,
    self_hosted_location_id,
  };

  const { data: s, error: eS } = await supa
    .from("sessions")
    .insert(insertSession)
    .select("id")
    .single();
  if (eS) throw eS;

  const sessionId = s.id;

  // Occurrences nur für Studio-Variante
  if (session.location_type === "studio_location" && studioSlotIds.length) {
    const { data: slots, error: eSlots } = await supa
      .from("studio_slots")
      .select("id, starts_at, ends_at, capacity")
      .in("id", studioSlotIds);
    if (eSlots) throw eSlots;

    const occ = slots.map(
      (sl) =>
        ({
          session_id: sessionId,
          studio_slot_id: sl.id,
          starts_at: sl.starts_at,
          ends_at: sl.ends_at,
          capacity: sl.capacity ?? session.max_participants ?? 1,
        } satisfies Database["public"]["Tables"]["session_occurrences"]["Insert"])
    );

    const { error: eOcc } = await supa.from("session_occurrences").insert(occ);
    if (eOcc) throw eOcc;
  }

  return { ok: true, sessionId };
}
