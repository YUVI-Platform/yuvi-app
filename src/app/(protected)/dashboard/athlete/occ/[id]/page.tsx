import { redirect } from "next/navigation";
import Image from "next/image";
import { supabaseServerRead } from "@/lib/supabaseServer";
import SeatsLeftBadge from "@/app/(protected)/components/SeatsLeftBadge";
import BookButton from "@/app/(protected)/components/BookButton";
import Link from "next/link";

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

  // 🔎 Vollständige Occurrence + Session + Location-Infos laden
  const { data: occ, error: occErr } = await supa
    .from("session_occurrences")
    .select(
      `
      id, starts_at, ends_at, capacity,
      sessions:session_id(
        id, title, description, duration_minutes, equipment, session_type,
        tags, image_urls, price_cents, recommended_level, max_participants,
        location_type, expert_user_id
      ),
      studio_slots:studio_slot_id(
        id, starts_at, ends_at, capacity, status, allowed_tags,
        studio_locations:location_id(
          id, title, description, address, image_urls, amenities,
          area_sqm, max_participants, house_rules, price_per_slot
        )
      ),
      self_hosted_slots:self_hosted_slot_id(
        id, starts_at, ends_at, capacity,
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

  // 👤 Bestehende Buchung des aktuellen Users?
  const { data: myBooking } = await supa
    .from("bookings")
    .select("id, status")
    .eq("occurrence_id", occId)
    .eq("athlete_user_id", me.user.id)
    .in("status", ["pending", "confirmed"])
    .maybeSingle();

  const s = occ.sessions;
  const isStudio = s?.location_type === "studio_location";
  const studioLoc = occ.studio_slots?.studio_locations ?? null;
  const selfLoc = occ.self_hosted_slots?.self_hosted_locations ?? null;

  const gallery = [
    ...(Array.isArray(s?.image_urls) ? s!.image_urls! : []),
    ...(Array.isArray(studioLoc?.image_urls) ? studioLoc!.image_urls! : []),
    ...(Array.isArray(selfLoc?.image_urls) ? selfLoc!.image_urls! : []),
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

      {/* Bilder-Galerie (falls vorhanden) */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-1 gap-3 ">
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

      {/* Beschreibung & Equipment */}
      {(s?.description ||
        (Array.isArray(s?.equipment) && s!.equipment!.length)) && (
        <div className="grid gap-4 md:grid-cols-3">
          {s?.description && (
            <div className="md:col-span-2">
              <h2 className="mb-1 text-base font-semibold">Beschreibung</h2>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {s.description}
              </p>
            </div>
          )}
          {Array.isArray(s?.equipment) && s!.equipment!.length > 0 && (
            <div className="md:col-span-1">
              <h3 className="mb-1 text-sm font-semibold">
                Benötigte Ausrüstung
              </h3>
              <ul className="list-inside list-disc text-sm text-slate-700">
                {s!.equipment!.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Location-Infos */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Ort</h2>

        {isStudio && studioLoc ? (
          <div className="space-y-1 text-sm text-slate-700">
            <div className="font-medium">{studioLoc.title ?? "Studio"}</div>
            {studioLoc.address && (
              <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs text-slate-700 ring-1 ring-slate-200">
                {JSON.stringify(studioLoc.address, null, 2)}
              </pre>
            )}
            {studioLoc.amenities?.length ? (
              <div className="flex flex-wrap gap-2">
                {studioLoc.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs ring-1 ring-slate-200"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : null}
            {studioLoc.house_rules && (
              <div>
                <div className="mt-2 text-xs font-medium text-slate-600">
                  Hausregeln
                </div>
                <p className="text-sm">{studioLoc.house_rules}</p>
              </div>
            )}
            <div className="text-xs text-slate-500">
              Fläche: {studioLoc.area_sqm ?? "—"} m² •{"  "}Slot-Preis (Host):{" "}
              {studioLoc.price_per_slot ? euro(studioLoc.price_per_slot) : "—"}
            </div>
          </div>
        ) : selfLoc ? (
          <div className="space-y-1 text-sm text-slate-700">
            <div className="font-medium">
              {selfLoc.title ?? "Self-Hosted Ort"}
            </div>
            {selfLoc.address && (
              <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs text-slate-700 ring-1 ring-slate-200">
                {JSON.stringify(selfLoc.address, null, 2)}
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
        <BookButton
          occurrenceId={occId}
          bookingId={myBooking?.id ?? null}
          path={pagePath}
        />

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
