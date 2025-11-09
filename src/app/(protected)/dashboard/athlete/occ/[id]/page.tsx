import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabaseServerRead } from "@/lib/supabaseServer";
import SeatsLeftBadge from "@/app/(protected)/components/SeatsLeftBadge";
import BookButton from "@/app/(protected)/components/BookButton";
import type { Enums } from "@/types/supabase";

function euro(cents?: number | null) {
  if (typeof cents !== "number") return "—";
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

export default async function OccDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: occId } = await params;

  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user) redirect(`/login?redirectTo=/dashboard/athlete/occ/${occId}`);

  // 1) Occurrence + Session + Slots + (Location mit location_id) laden
  const { data: occ, error: occErr } = await supa
    .from("session_occurrences")
    .select(
      `
      id, starts_at, ends_at, capacity, studio_slot_id, self_hosted_slot_id,
      sessions:session_id(
        id, title, description, duration_minutes, equipment, session_type,
        tags, image_urls, price_cents, recommended_level, max_participants,
        location_type, expert_user_id
      ),
      studio_slots:studio_slot_id(
        id, starts_at, ends_at, capacity, status, allowed_tags, location_id,
        studio_locations:location_id(
          id, title, description, address, image_urls, amenities,
          area_sqm, max_participants, house_rules, price_per_slot
        )
      ),
      self_hosted_slots:self_hosted_slot_id(
        id, starts_at, ends_at, capacity, self_location_id,
        self_hosted_locations:self_location_id(
          id, title, address, image_urls
        )
      )
    `
    )
    .eq("id", occId)
    .maybeSingle();

  if (occErr) {
    return (
      <div className="p-4 text-sm text-rose-600">
        Fehler beim Laden: {occErr.message}
      </div>
    );
  }
  if (!occ) {
    return (
      <div className="p-4 text-sm text-rose-600">
        Occurrence nicht gefunden.
      </div>
    );
  }

  // 2) Eigene Buchung (aktiv)
  const { data: rawBooking } = await supa
    .from("bookings")
    .select("id, status, payment, checked_in_at")
    .eq("occurrence_id", occId)
    .eq("athlete_user_id", me.user.id)
    .maybeSingle<{
      id: string;
      status: Enums<"booking_status">;
      payment: Enums<"payment_status">;
      checked_in_at: string | null;
    }>();

  const myBooking =
    rawBooking &&
    !["cancelled", "completed", "no_show"].includes(rawBooking.status)
      ? rawBooking
      : null;

  const s = occ.sessions;

  // 3) Harte Entscheidung nach Slot-IDs (höchste Priorität), danach Session.location_type
  type Kind = "studio" | "self" | null;
  let kind: Kind = null;

  if (occ.studio_slot_id) {
    kind = "studio";
  } else if (occ.self_hosted_slot_id) {
    kind = "self";
  } else if (s?.location_type === "studio_location") {
    kind = "studio";
  } else if (s?.location_type === "self_hosted") {
    kind = "self";
  }

  // 4) Location-Objekt robust auflösen, ggf. Nachladen falls Nested null (RLS/Join)
  let studioLoc = occ.studio_slots?.studio_locations ?? null; // evtl. null wegen RLS/Join
  let selfLoc = occ.self_hosted_slots?.self_hosted_locations ?? null; // evtl. null wegen RLS/Join

  if (kind === "studio" && !studioLoc) {
    const studioLocationId = occ.studio_slots?.location_id;
    if (studioLocationId) {
      const { data: loc } = await supa
        .from("studio_locations")
        .select(
          "id, title, description, address, image_urls, amenities, area_sqm, max_participants, house_rules, price_per_slot"
        )
        .eq("id", studioLocationId)
        .maybeSingle();
      studioLoc = loc ?? null;
    }
  }

  if (kind === "self" && !selfLoc) {
    const selfLocationId = occ.self_hosted_slots?.self_location_id;
    if (selfLocationId) {
      const { data: loc } = await supa
        .from("self_hosted_locations")
        .select("id, title, address, image_urls")
        .eq("id", selfLocationId)
        .maybeSingle();
      selfLoc = loc ?? null;
    }
  }

  // 5) Finale "resolvedLocation"
  type Resolved =
    | { kind: "studio"; data: NonNullable<typeof studioLoc> }
    | { kind: "self"; data: NonNullable<typeof selfLoc> }
    | null;

  let resolvedLocation: Resolved = null;
  if (kind === "studio" && studioLoc)
    resolvedLocation = { kind: "studio", data: studioLoc };
  if (kind === "self" && selfLoc)
    resolvedLocation = { kind: "self", data: selfLoc };

  // 6) Galerie: Session-Bilder + Bilder der gewählten Location
  const gallery = [
    ...(Array.isArray(s?.image_urls) ? s!.image_urls! : []),
    ...(resolvedLocation?.data?.image_urls ?? []),
  ].filter(Boolean);

  const pagePath = `/dashboard/athlete/occ/${occId}`;

  return (
    <div className="p-4 space-y-6">
      {/* Titel + Meta */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{s?.title ?? "Session"}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <SeatsLeftBadge occurrenceId={occId} />
          <span>
            {new Date(occ.starts_at).toLocaleString()} –{" "}
            {new Date(occ.ends_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {typeof s?.duration_minutes === "number" && (
            <span>• Dauer: {s.duration_minutes} Min</span>
          )}
          {s?.session_type && <span>• Typ: {s.session_type}</span>}
          {s?.recommended_level && <span>• Level: {s.recommended_level}</span>}
          {typeof s?.max_participants === "number" && (
            <span>• Max: {s.max_participants}</span>
          )}
        </div>
      </div>

      {/* Bilder */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {gallery.slice(0, 6).map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={s?.title ?? "Session Bild"}
              width={800}
              height={530}
              className="h-auto w-full rounded-xl border object-cover"
            />
          ))}
        </div>
      )}

      {/* Preis & Tags */}
      <div className="space-y-2">
        <div className="text-base">
          Preis: <span className="font-medium">{euro(s?.price_cents)}</span>
        </div>
        {!!s?.tags?.length && (
          <div className="flex flex-wrap gap-2">
            {s.tags!.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-200"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Location-Infos */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Ort</h2>

        {resolvedLocation?.kind === "studio" ? (
          <div className="space-y-1 text-sm text-slate-700">
            <div className="font-medium">
              {resolvedLocation.data.title ?? "Studio"}
            </div>
            {resolvedLocation.data.address && (
              <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs text-slate-700 ring-1 ring-slate-200">
                {JSON.stringify(resolvedLocation.data.address, null, 2)}
              </pre>
            )}
            {Array.isArray(resolvedLocation.data.amenities) &&
              resolvedLocation.data.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resolvedLocation.data.amenities.map((a: string) => (
                    <span
                      key={a}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs ring-1 ring-slate-200"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            {resolvedLocation.data.house_rules && (
              <div>
                <div className="mt-2 text-xs font-medium text-slate-600">
                  Hausregeln
                </div>
                <p className="text-sm">{resolvedLocation.data.house_rules}</p>
              </div>
            )}
            <div className="text-xs text-slate-500">
              Fläche: {resolvedLocation.data.area_sqm ?? "—"} m² • Slot-Preis
              (Host):{" "}
              {resolvedLocation.data.price_per_slot
                ? euro(resolvedLocation.data.price_per_slot)
                : "—"}
            </div>
          </div>
        ) : resolvedLocation?.kind === "self" ? (
          <div className="space-y-1 text-sm text-slate-700">
            <div className="font-medium">
              {resolvedLocation.data.title ?? "Self-Hosted Ort"}
            </div>
            {resolvedLocation.data.address && (
              <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs text-slate-700 ring-1 ring-slate-200">
                {JSON.stringify(resolvedLocation.data.address, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            Ort wird noch bekanntgegeben.
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="pt-2 flex gap-4 w-full">
        <BookButton occurrenceId={occId} booking={myBooking} path={pagePath} />
        {myBooking && (
          <Link
            href={`/dashboard/athlete/occ/${occId}/checkin`}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-yuvi-skyblue text-white hover:bg-yuvi-skyblue-dark disabled:opacity-50"
          >
            Check-in starten
          </Link>
        )}
      </div>
    </div>
  );
}
