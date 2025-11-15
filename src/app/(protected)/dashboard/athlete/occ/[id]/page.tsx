// src/app/(protected)/dashboard/athlete/occ/[id]/page.tsx
import "server-only";
import { unstable_noStore as noStore } from "next/cache";

export const fetchCache = "default-no-store";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabaseServerRead } from "@/lib/supabaseServer";
// import SeatsLeftBadge from "@/app/(protected)/components/SeatsLeftBadge";
import BookButton from "@/app/(protected)/components/BookButton";
import LiveCountdown from "./LiveCountdown"; // ⬅️ NEU
import type { Enums } from "@/types/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function euro(cents?: number | null) {
  if (typeof cents !== "number") return "—";
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

type AnyAddress = Record<string, any> | string | null | undefined;
function formatAddress(addr: AnyAddress) {
  if (!addr) return null;
  if (typeof addr === "string") return addr;

  const parts = [
    addr.street || addr.street1 || addr.line1,
    addr.street2 || addr.line2,
    [addr.postal_code || addr.zip || addr.plz, addr.city || addr.town]
      .filter(Boolean)
      .join(" "),
    addr.state,
    addr.country,
  ].filter(Boolean);

  const text = parts.join(", ").replace(/\s+,/g, ",").trim();
  return text.length ? text : null;
}
function mapLinkFromAddress(addr: AnyAddress) {
  const text = formatAddress(addr);
  return text ? `https://maps.google.com/?q=${encodeURIComponent(text)}` : null;
}

function StarBar({ value = 0 }: { value?: number | null }) {
  const v = Math.max(0, Math.min(5, Number(value ?? 0)));
  const pct = (v / 5) * 100;
  return (
    <div
      className="relative inline-block align-middle"
      style={{ width: 90, height: 18 }}
    >
      <div className="absolute inset-0 flex gap-[2px] text-yellow-500/30">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={`o${i}`}
            viewBox="0 0 24 24"
            width={18}
            height={18}
            aria-hidden="true"
          >
            <path
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        ))}
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <div className="flex gap-[2px] text-yuvi-skyblue">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={`f${i}`}
              viewBox="0 0 24 24"
              width={18}
              height={18}
              aria-hidden="true"
            >
              <path
                d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill="currentColor"
              />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function OccDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();

  const { id: occId } = await params; // <-- statt params.id
  if (!occId) {
    return (
      <div className="p-4 text-sm text-rose-600">
        Ungültige URL: Keine Occurrence-ID gefunden.
      </div>
    );
  }

  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user) redirect(`/login?redirectTo=/dashboard/athlete/occ/${occId}`);

  // Occ + Session + Slots + Locations
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

  if (occErr)
    return (
      <div className="p-4 text-sm text-rose-600">
        Fehler beim Laden: {occErr.message}
      </div>
    );
  if (!occ)
    return (
      <div className="p-4 text-sm text-rose-600">
        Occurrence nicht gefunden.
      </div>
    );

  const s = occ.sessions;

  // Eigene Buchung
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

  // Slot/Location Typ
  type Kind = "studio" | "self" | null;
  let kind: Kind = null;
  if (occ.studio_slot_id) kind = "studio";
  else if (occ.self_hosted_slot_id) kind = "self";
  else if (s?.location_type === "studio_location") kind = "studio";
  else if (s?.location_type === "self_hosted") kind = "self";

  // Location auflösen mit **dreifachem Fallback**
  let studioLoc = occ.studio_slots?.studio_locations ?? null;
  let selfLoc = occ.self_hosted_slots?.self_hosted_locations ?? null;

  if (kind === "studio" && !studioLoc) {
    // Fallback 1: location_id direkt im Join
    let locationId = occ.studio_slots?.location_id as string | null | undefined;

    // Fallback 2: falls Join leer, hole Slot → location_id
    if (!locationId && occ.studio_slot_id) {
      const { data: slotRow } = await supa
        .from("studio_slots")
        .select("location_id")
        .eq("id", occ.studio_slot_id)
        .maybeSingle();
      locationId = slotRow?.location_id ?? null;
    }

    // Fallback 3: hole Location über location_id
    if (locationId) {
      const { data: loc } = await supa
        .from("studio_locations")
        .select(
          "id, title, description, address, image_urls, amenities, area_sqm, max_participants, house_rules, price_per_slot"
        )
        .eq("id", locationId)
        .maybeSingle();
      studioLoc = loc ?? null;
    }
  }

  if (kind === "self" && !selfLoc) {
    let selfLocationId = occ.self_hosted_slots?.self_location_id as
      | string
      | null
      | undefined;

    if (!selfLocationId && occ.self_hosted_slot_id) {
      const { data: slotRow } = await supa
        .from("self_hosted_slots")
        .select("self_location_id")
        .eq("id", occ.self_hosted_slot_id)
        .maybeSingle();
      selfLocationId = slotRow?.self_location_id ?? null;
    }

    if (selfLocationId) {
      const { data: loc } = await supa
        .from("self_hosted_locations")
        .select("id, title, address, image_urls")
        .eq("id", selfLocationId)
        .maybeSingle();
      selfLoc = loc ?? null;
    }
  }

  type Resolved =
    | { kind: "studio"; data: NonNullable<typeof studioLoc> }
    | { kind: "self"; data: NonNullable<typeof selfLoc> }
    | null;

  let resolvedLocation: Resolved = null;
  if (kind === "studio" && studioLoc)
    resolvedLocation = { kind: "studio", data: studioLoc };
  if (kind === "self" && selfLoc)
    resolvedLocation = { kind: "self", data: selfLoc };

  const addressObj =
    resolvedLocation?.kind === "studio"
      ? (resolvedLocation.data as any).address
      : resolvedLocation?.kind === "self"
      ? (resolvedLocation.data as any).address
      : null;

  const addressText = formatAddress(addressObj);
  const mapHref = mapLinkFromAddress(addressObj);

  // Galerie
  const gallery = [
    ...(Array.isArray(s?.image_urls) ? s!.image_urls! : []),
    ...(resolvedLocation?.data?.image_urls ?? []),
  ].filter(Boolean);
  const hero = gallery[0] ?? null;
  const thumbs = hero ? gallery.slice(1, 7) : gallery.slice(0, 6);

  // Expert laden (robust: training_focus statt specialties)
  type MEPRow = {
    user_id: string;
    bio: string | null;
    training_focus: string[] | null;
    licenses: string[] | null;
    rating_avg: number | null;
    rating_count: number | null;
    portfolio_image_urls: string[] | null;
  };

  let expert: {
    user_id: string;
    name: string | null;
    avatar_url: string | null;
    alias?: string | null;
    bio?: string | null;
    specialties?: string[] | null; // <- gemappt aus training_focus
    licenses?: string[] | null;
    rating_avg?: number | null;
    rating_count?: number | null;
    portfolio?: string[] | null;
  } | null = null;

  const expertId = s?.expert_user_id ?? null;
  if (expertId) {
    const [{ data: prof }, { data: mep }] = await Promise.all([
      supa
        .from("profiles")
        .select("user_id, name, alias, avatar_url")
        .eq("user_id", expertId)
        .maybeSingle(),
      supa
        .from("motion_expert_profiles")
        .select(
          "user_id, bio, training_focus, licenses, rating_avg, rating_count, portfolio_image_urls"
        )
        .eq("user_id", expertId)
        .maybeSingle<MEPRow>(),
    ]);

    if (prof || mep) {
      expert = {
        user_id: expertId,
        name: prof?.name ?? prof?.alias ?? null,
        avatar_url: prof?.avatar_url ?? null,
        alias: prof?.alias ?? null,
        bio: mep?.bio ?? null,
        specialties: mep?.training_focus ?? null, // <- wichtig
        licenses: mep?.licenses ?? null,
        rating_avg: mep?.rating_avg ?? null,
        rating_count: mep?.rating_count ?? null,
        portfolio: mep?.portfolio_image_urls ?? null,
      };
    }
  }
  const pagePath = `/dashboard/athlete/occ/${occId}`;

  return (
    <div className="p-4 space-y-6 mb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-wider text-yuvi-skyblue font-fancy">
          {(s?.title ?? "Session").toUpperCase()}
        </h1>
        <LiveCountdown
          startIso={occ.starts_at}
          className=" rounded bg-blue-100 px-2 py-0.5 text-xs ring-1 ring-blue-200 text-blue-800"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        {/* <SeatsLeftBadge occurrenceId={occId} /> */}
        <span>
          {new Date(occ.starts_at).toLocaleString()} –{" "}
          {new Date(occ.ends_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {/* ⬇️ Countdown jetzt als Client-Komponente (CSP-sicher) */}
      </div>
      {hero && (
        <div>
          <Image
            src={hero}
            alt={s?.title ?? "Session Bild"}
            width={1200}
            height={675}
            className="h-auto w-full rounded-xl border object-cover"
            priority
          />
        </div>
      )}{" "}
      {thumbs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {thumbs.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={s?.title ?? "Session Bild"}
              width={600}
              height={400}
              className="h-auto w-full rounded-lg border object-cover"
            />
          ))}
        </div>
      )}
      <div className="space-y-2"></div>
      {expert && (
        <details className="rounded-xl border bg-white p-4 open:shadow-sm">
          <summary className="flex cursor-pointer list-none items-center gap-3">
            <Image
              src={expert.avatar_url || "/avatar.png"}
              alt={expert.name ?? "Expert"}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                {expert.name ?? "Motion Expert"}
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <StarBar value={expert.rating_avg ?? 0} />
                {typeof expert.rating_count === "number" && (
                  <span className="text-slate-500">
                    ({expert.rating_count})
                  </span>
                )}
              </div>
            </div>
            <span className="ml-auto text-xs text-slate-500">
              Details anzeigen
            </span>
          </summary>

          <div className="mt-3 space-y-4 text-sm text-slate-700">
            {/* Bio */}
            {expert.bio && <p className="leading-relaxed">{expert.bio}</p>}

            {/* Schwerpunkte */}
            {Array.isArray(expert.specialties) &&
              expert.specialties.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-600 mb-1">
                    Schwerpunkte
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expert.specialties.map((sp, i) => (
                      <span
                        key={i}
                        className="rounded bg-slate-100 px-2 py-0.5 text-xs ring-1 ring-slate-200"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Lizenzen */}
            {Array.isArray(expert.licenses) && expert.licenses.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-600 mb-1">
                  Lizenzen
                </div>
                <ul className="list-disc pl-5">
                  {expert.licenses.map((lic, i) => (
                    <li key={i}>{lic}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Portfolio (optional) */}
            {Array.isArray(expert.portfolio) && expert.portfolio.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-600 mb-2">
                  Portfolio
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {expert.portfolio.slice(0, 6).map((src, i) => (
                    <Image
                      key={i}
                      src={src}
                      alt={`Portfolio Bild ${i + 1}`}
                      width={600}
                      height={400}
                      className="h-auto w-full rounded-lg border object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </details>
      )}
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
      <div className="space-y-2">
        <h2 className="text-base font-semibold">Ort</h2>
        {resolvedLocation ? (
          <div className="space-y-1 text-sm text-slate-700">
            <div className="font-medium">
              {(resolvedLocation.data as any).title ?? "Location"}
            </div>
            {addressText ? (
              <div className="text-slate-700">
                {mapHref ? (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted underline-offset-2"
                  >
                    {addressText}
                  </a>
                ) : (
                  <span>{addressText}</span>
                )}
              </div>
            ) : (
              <div className="text-slate-500">
                Adresse wird noch bekanntgegeben.
              </div>
            )}

            {resolvedLocation.kind === "studio" && (
              <>
                {Array.isArray((resolvedLocation.data as any).amenities) &&
                  (resolvedLocation.data as any).amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(resolvedLocation.data as any).amenities.map(
                        (a: string) => (
                          <span
                            key={a}
                            className="rounded bg-slate-100 px-2 py-0.5 text-xs ring-1 ring-slate-200"
                          >
                            {a}
                          </span>
                        )
                      )}
                    </div>
                  )}
                {(resolvedLocation.data as any).house_rules && (
                  <div>
                    <div className="mt-2 text-xs font-medium text-slate-600">
                      Hausregeln
                    </div>
                    <p className="text-sm">
                      {(resolvedLocation.data as any).house_rules}
                    </p>
                  </div>
                )}
                <div className="text-xs text-slate-500">
                  Fläche: {(resolvedLocation.data as any).area_sqm ?? "—"} m² •
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            Ort wird noch bekanntgegeben.
          </div>
        )}
      </div>
      <div className="fixed bottom-18 bg-white py-4 flex gap-4 w-full">
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
