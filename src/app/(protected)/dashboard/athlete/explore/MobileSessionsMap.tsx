// src/app/(protected)/dashboard/athlete/ui/MobileSessionsMap.tsx
"use client";

import type { Database } from "@/types/supabase";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  type MapRef,
  type ViewState,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/lib/supabaseBrowser";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import SessionCard from "@/app/(protected)/dashboard/athlete/ui/SessionCard";

/** Erwartete RPC: public.find_occurrences_in_bbox(
 *  p_min_lat float8, p_min_lng float8, p_max_lat float8, p_max_lng float8,
 *  p_from date, p_to date
 * ) returns rows: { occurrence_id, session_id, title, lat, lng, starts_at, ends_at, price_cents, session_type, tags, seats_left }
 *
 * Optional: public.occ_stats(p_occurrence uuid, p_hold_minutes int default 15)
 * returns (total_cap int, booked int, seats_left int)
 */

type OccurrencePin = {
  occurrence_id: string;
  session_id: string;
  title: string;
  lat: number | null;
  lng: number | null;
  starts_at?: string;
  ends_at?: string;
  price_cents?: number;
  session_type?: string;
  tags?: string[] | null;
  seats_left?: number | null;
};

function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* Lokales YYYY-MM-DD */
const localISODate = (d = new Date()) => {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
};
const addDaysISO = (iso: string, days: number) => {
  const [y, m, dd] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, dd + days);
  return localISODate(d);
};

type Filters = {
  fromISO: string;
  toISO: string;
};

// ... deine Imports bleiben wie gehabt ...

/** Optional: deine Brandfarben */
const YUVI_BLUE = "#3bb7fc"; // skyblue
const FULL_RED = "#ef4444"; // aus Tailwind Rose-500-ish

/** Hübscher Marker als SVG mit Shadow + Seats-Badge */
function PrettyMarker({
  seatsLeft,
  title,
}: {
  seatsLeft?: number | null;
  title?: string;
}) {
  const hasFree = typeof seatsLeft === "number" ? seatsLeft > 0 : true;
  const fill = hasFree ? YUVI_BLUE : FULL_RED;

  return (
    <div className="group relative -mb-1 select-none">
      {/* Pin */}
      <svg
        viewBox="0 0 40 52"
        width={40}
        height={52}
        className="drop-shadow-[0_6px_14px_rgba(0,0,0,0.25)] transition-transform group-active:scale-95"
        aria-label={title ?? "Session"}
      >
        {/* Pin-Form */}
        <path
          d="M20 0c11 0 20 8.6 20 19.2 0 8.7-6 16-14.3 18.1L21.3 51c-.3 1-2.3 1-2.6 0l-4.4-13.7C6 35.2 0 27.9 0 19.2 0 8.6 9 0 20 0z"
          fill={fill}
        />
        {/* Innenkreis */}
        <circle cx="20" cy="19" r="8.5" fill="#fff" />
        <circle cx="20" cy="19" r="5.5" fill={fill} />
      </svg>

      {/* Seats-Badge */}
      {typeof seatsLeft === "number" && (
        <span
          className="absolute -top-1 -right-1 rounded-full bg-yuvi-rose px-1.5 py-0.5 text-[11px] font-medium text-white font-fancy ring-1 ring-black/10 shadow-sm"
          title="Freie Plätze"
        >
          {seatsLeft}
        </span>
      )}
    </div>
  );
}

export default function MobileSessionsMap() {
  const mapRef = useRef<MapRef | null>(null);
  const [pins, setPins] = useState<OccurrencePin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewState, setViewState] = useState<ViewState>({
    longitude: 11.5761,
    latitude: 48.1374,
    zoom: 11,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, left: 0, right: 0, bottom: 0 },
  });

  // Heute / Morgen
  const [dayOffset, setDayOffset] = useState(0);
  const todayISO = useMemo(() => localISODate(new Date()), []);
  const [filters, setFilters] = useState<Filters>({
    fromISO: todayISO,
    toISO: todayISO,
  });

  // Dialog (Quick-View) mit SessionCard
  type OccForCard = Parameters<typeof SessionCard>[0]["occurrence"];
  const [openCard, setOpenCard] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [occForCard, setOccForCard] = useState<OccForCard | null>(null);

  // Pins laden (BBOX + Datum)
  const fetchPinsByBounds = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;

    setLoading(true);
    setError(null);

    const payload = {
      p_min_lat: bounds.getSouth(),
      p_min_lng: bounds.getWest(),
      p_max_lat: bounds.getNorth(),
      p_max_lng: bounds.getEast(),
      p_from: filters.fromISO,
      p_to: filters.toISO,
    };

    const { data, error } = await supabase.rpc(
      "find_occurrences_in_bbox",
      payload
    );

    if (error) {
      setError(
        error.message ??
          "Fehler beim Laden der Sessions (find_occurrences_in_bbox)"
      );
      setPins([]);
    } else {
      const rows = (data as OccurrencePin[]).filter(
        (r) => typeof r.lat === "number" && typeof r.lng === "number"
      );
      setPins(
        rows.sort((a, b) =>
          String(a.starts_at ?? "").localeCompare(String(b.starts_at ?? ""))
        )
      );
    }

    setLoading(false);
  }, [filters]);

  const debouncedFetch = useMemo(
    () => debounce(fetchPinsByBounds, 350),
    [fetchPinsByBounds]
  );

  const handleMoveEnd = useCallback(() => {
    debouncedFetch();
  }, [debouncedFetch]);

  const handleLoad = useCallback(() => {
    fetchPinsByBounds();
  }, [fetchPinsByBounds]);

  // Geolocate once
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const w = window as any;
    if (w.__yuvi_map_centered) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setViewState((vs) => ({ ...vs, longitude, latitude, zoom: 12 }));
        w.__yuvi_map_centered = true;
      },
      () => {},
      { enableHighAccuracy: true, timeout: 4000 }
    );
  }, []);

  // Day switch -> from/to
  useEffect(() => {
    const base = localISODate(new Date());
    const day = addDaysISO(base, dayOffset);
    setFilters({ fromISO: day, toISO: day });
  }, [dayOffset]);

  // Filters geändert -> neu laden
  useEffect(() => {
    debouncedFetch();
  }, [filters, debouncedFetch]);

  // Occ für Dialog laden
  const openOccDialog = useCallback(async (occId: string) => {
    setCardLoading(true);
    setOpenCard(true);
    try {
      const { data: occ, error: occErr } = await supabase
        .from("session_occurrences")
        .select(
          `
          id, starts_at, ends_at, capacity,
          sessions:session_id(
            id, title, image_urls, session_type, price_cents, tags, location_type,
            max_participants, expert_user_id
          ),
          studio_slots(
            id, capacity,
            studio_locations(title, address, image_urls, max_participants)
          ),
          self_hosted_slots(
            id, capacity
          )
        `
        )
        .eq("id", occId)
        .maybeSingle();

      if (occErr || !occ) throw new Error(occErr?.message || "Not found");

      // Versuche Stats via RPC, falle sonst sauber zurück
      let cap: number | null = null;
      let booked: number | null = null;
      try {
        const { data: statsRows, error: statsErr } = await supabase.rpc(
          "occ_stats",
          { p_occurrence: occId, p_hold_minutes: 15 }
        );
        if (!statsErr && Array.isArray(statsRows) && statsRows[0]) {
          cap = (statsRows[0].total_cap as number) ?? null;
          booked = (statsRows[0].booked as number) ?? null;
        }
      } catch {
        /* ignore */
      }

      // Fallback Kapazität (Minimum aus allen bekannten Quellen)
      const nums = (...vals: Array<number | null | undefined>) =>
        vals.filter(
          (v): v is number =>
            typeof v === "number" && Number.isFinite(v) && v >= 0
        );
      if (cap == null) {
        const cands = nums(
          occ.capacity,
          (occ.studio_slots as any)?.capacity,
          (occ.self_hosted_slots as any)?.capacity,
          occ.sessions?.max_participants,
          (occ.studio_slots as any)?.studio_locations?.max_participants
        );
        cap = cands.length ? Math.min(...cands) : null;
      }

      const mapped: OccForCard = {
        id: occ.id,
        starts_at: occ.starts_at,
        ends_at: occ.ends_at,
        capacity: cap,
        booked_count: booked, // kann null sein – SessionCard kann das darstellen
        sessions: occ.sessions
          ? {
              id: occ.sessions.id,
              title: occ.sessions.title ?? "Ohne Titel",
              image_urls: occ.sessions.image_urls ?? null,
              session_type: occ.sessions.session_type ?? null,
              price_cents: occ.sessions.price_cents ?? null,
              tags: occ.sessions.tags ?? null,
              location_type: occ.sessions.location_type ?? null,
            }
          : null,
        studio_slots: occ.studio_slots ?? null,
      };

      setOccForCard(mapped);
    } catch (e) {
      setOccForCard(null);
    } finally {
      setCardLoading(false);
    }
  }, []);

  const dayLabel =
    dayOffset === 0 ? "heute" : dayOffset === 1 ? "morgen" : filters.fromISO;

  return (
    <div className="relative h-dvh w-full">
      <Map
        ref={mapRef}
        mapLib={import("mapbox-gl")}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11" // ⬅️ vorher: streets-v12
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
        onClick={() => setOpenCard(false)}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          showUserHeading
        />

        {pins.map((p) => (
          <Marker
            key={p.occurrence_id}
            longitude={p.lng!}
            latitude={p.lat!}
            anchor="bottom" // Spitze des Pins zeigt auf den Punkt
          >
            <button
              aria-label={`Open ${p.title}`}
              onClick={(e) => {
                e.stopPropagation();
                openOccDialog(p.occurrence_id);
              }}
              className="focus:outline-none"
            >
              <PrettyMarker
                seatsLeft={p.seats_left ?? undefined}
                title={p.title}
              />
            </button>
          </Marker>
        ))}
      </Map>

      {/* Day Switch */}
      <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
        <div className="flex overflow-hidden rounded-full border border-slate-200 bg-white/95 shadow">
          {[
            { label: "Heute", off: 0 },
            { label: "Morgen", off: 1 },
          ].map((d) => (
            <button
              key={d.off}
              onClick={() => setDayOffset(d.off)}
              className={`px-3 py-1.5 text-xs ${
                dayOffset === d.off ? "bg-black text-white" : "text-slate-700"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Pill */}
      <div className="pointer-events-none absolute left-1/2 top-3 translate-y-[52px] -translate-x-1/2">
        <div className="rounded-full bg-black/70 px-3 py-1 text-xs text-white shadow-md">
          {loading ? "Lade Sessions…" : `${pins.length} Sessions ${dayLabel}`}
        </div>
      </div>

      {/* Tagesliste als Chips */}
      <div className="absolute inset-x-0 top-24 z-10">
        <div className="mx-auto w-[min(800px,95%)]">
          <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl">
            {pins.length ? (
              pins.map((p) => (
                <button
                  key={`chip-${p.occurrence_id}`}
                  onClick={() => openOccDialog(p.occurrence_id)}
                  className="min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:bg-slate-50"
                >
                  <div className="font-medium text-slate-900">
                    {p.starts_at
                      ? new Date(p.starts_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}{" "}
                    –{" "}
                    {p.ends_at
                      ? new Date(p.ends_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </div>
                  <div className="truncate text-slate-600">{p.title}</div>
                  {typeof p.seats_left === "number" && (
                    <div className="mt-1 text-[11px] text-slate-500">
                      {p.seats_left} frei
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-600">
                Keine Occurrences für den Tag im aktuellen Ausschnitt.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick-View Dialog */}
      <Dialog
        open={openCard}
        onOpenChange={(next) => {
          setOpenCard(next);
          if (!next) setOccForCard(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="text-base">Session</DialogTitle>
          {cardLoading && (
            <div className="py-6 text-sm text-slate-500">Lade…</div>
          )}
          {occForCard && (
            <SessionCard
              occurrence={occForCard}
              initialBookingId={null}
              path="/dashboard/athlete"
              detailsHref={`/dashboard/athlete/occ/${occForCard.id}`}
            />
          )}
          {!cardLoading && !occForCard && (
            <div className="py-6 text-sm text-rose-600">
              Konnte die Session nicht laden.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Error toast */}
      {error && (
        <div className="pointer-events-none absolute left-1/2 top-[110px] -translate-x-1/2">
          <div className="rounded-md bg-rose-600 px-3 py-2 text-xs text-white shadow-md">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
