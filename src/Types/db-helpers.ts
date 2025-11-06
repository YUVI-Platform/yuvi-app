// src/types/db-helpers.ts
import type { Tables, TablesInsert, Enums } from "@/types/supabase";

export type SessionRow = Tables<"sessions">;
export type SessionInsert = TablesInsert<"sessions">;
export type SessionOccurrenceInsert = TablesInsert<"session_occurrences">;
export type StudioSlotRow = Tables<"studio_slots">;

export type SessionTypeEnum = Enums<"session_type">; // "private" | "group" | "trainWithMe"
export type LocationTypeEnum = Enums<"location_type">; // "self_hosted" | "studio_location"
