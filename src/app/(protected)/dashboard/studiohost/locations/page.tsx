// src/app/dashboard/studiohost/locations/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import LocationsClient from "./ui/LocationsClient";

export type LocationRow = {
  id: string;
  title: string | null;
  description: string | null;
  address: {
    street?: string;
    zip?: string;
    city?: string;
    country?: string;
  } | null;
  image_urls: string[] | null;
  amenities: string[] | null;
  allowed_tags: string[] | null;
  max_participants: number | null;
  is_draft: boolean | null;
  verification: string | null; // dein enum
  updated_at: string | null;
  created_at: string | null;
  owner_user_id: string | null;
  host_user_id: string | null;
};

export default async function StudioHostLocationsPage() {
  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user) redirect("/login?redirectTo=/dashboard/studiohost/locations");
  const uid = me.user.id;

  // nur eigene Locations (Owner ODER Host)
  const { data, error } = await supa
    .from("studio_locations")
    .select(
      "id,title,description,address,image_urls,amenities,allowed_tags,max_participants,is_draft,verification,updated_at,created_at,owner_user_id,host_user_id"
    )
    .or(`owner_user_id.eq.${uid},host_user_id.eq.${uid}`)
    .order("updated_at", { ascending: false });

  if (error) {
    // In Prod: hübsche Fehlerseite
    throw new Error(error.message);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Deine Locations</h1>
          <p className="text-sm text-slate-600">
            Verwalte Studios, veröffentliche oder bearbeite sie.
          </p>
        </div>
        <Link
          href="/dashboard/studioHost/locations/new"
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-black/90"
        >
          + Neue Location
        </Link>
      </div>

      <LocationsClient items={(data ?? []) as LocationRow[]} />
    </div>
  );
}
