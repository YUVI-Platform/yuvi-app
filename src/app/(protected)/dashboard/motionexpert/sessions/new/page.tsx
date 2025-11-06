// src/app/(protected)/dashboard/motionexpert/sessions/new/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServerRead } from "@/lib/supabaseServer";
import NewSessionWizard from "./ui/NewSessionWizard";

export const dynamic = "force-dynamic";

export default async function NewSessionPage() {
  const supa = await supabaseServerRead();

  // Auth
  const { data: me } = await supa.auth.getUser();
  const user = me?.user;
  if (!user) redirect("/login?redirectTo=/dashboard/motionexpert/sessions/new");

  // Rollencheck (motionExpert oder admin)
  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isMotionExpert =
    !!roles?.some((r) => r.role === "motionExpert") ||
    !!roles?.some((r) => r.role === "admin");
  if (!isMotionExpert) redirect("/dashboard");

  // Veröffentliche Locations laden
  const { data: locs, error } = await supa
    .from("studio_locations")
    .select(
      "id,title,description,address,image_urls,amenities,max_participants,area_sqm,house_rules,allowed_tags,price_per_slot,is_draft"
    )
    .eq("is_draft", false)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) console.warn("studio_locations query:", error.message);

  const locations = (locs ?? []).map((l) => ({
    id: l.id as string,
    title: (l.title ?? null) as string | null,
    description: (l.description ?? null) as string | null,
    address: (l.address ?? null) as {
      street?: string | null;
      zip?: string | null;
      city?: string | null;
      country?: string | null;
    } | null,
    image_urls: (Array.isArray(l.image_urls) ? l.image_urls : null) as
      | string[]
      | null,
    amenities: (Array.isArray(l.amenities) ? l.amenities : null) as
      | string[]
      | null,
    max_participants: (typeof l.max_participants === "number"
      ? l.max_participants
      : null) as number | null,
    area_sqm: (typeof l.area_sqm === "number" ? l.area_sqm : null) as
      | number
      | null,
    house_rules: (l.house_rules ?? null) as string | null,
    allowed_tags: (Array.isArray(l.allowed_tags) ? l.allowed_tags : null) as
      | string[]
      | null,
    price_per_slot: (typeof l.price_per_slot === "number"
      ? l.price_per_slot
      : null) as number | null,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Neue Session</h1>
          <p className="text-sm text-slate-600">
            Erstelle eine Session und prüfe, ob ein Studio zu dir passt.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm underline text-slate-600 hover:text-slate-900"
        >
          Abbrechen
        </Link>
      </div>

      <NewSessionWizard locations={locations} />
    </div>
  );
}
