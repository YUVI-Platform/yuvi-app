// ui/types.ts
export type SessionType = "private" | "group" | "trainWithMe";
export type LocationType = "studio_location" | "self_hosted";

export type WizardData = {
  session_type?: SessionType;
  location_type?: LocationType;
  studio_location_id?: string | null;
  self_hosted?: {
    title?: string;
    address?: {
      street?: string;
      zip?: string;
      city?: string;
      country?: string;
    };
    image_urls?: string[];
    capacity?: number | null;
  } | null;
  slot_ids?: string[]; // ausgewählte studio_slots.id
  details?: {
    title?: string;
    description?: string;
    price_cents?: number | null;
    duration_minutes?: number;
    tags?: string[];
    max_participants?: number | null;
  };
};
