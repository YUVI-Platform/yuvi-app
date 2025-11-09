"use client";

// ✅ Modernized for react-map-gl v8 + mapbox-gl v3
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
import Link from "next/link";
import { supabase } from "@/lib/supabaseBrowser";

export type OccurrencePin = {
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
  seats_left?: number;
};

function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

const SESSION_TYPES = [
  { key: "group", label: "Group" },
  { key: "private", label: "Private" },
  { key: "trainWithMe", label: "Train with me" },
] as const;

// ---- Typing ----
// Falls deine Supabase-Typen die Funktion noch nicht kennen, nutze manuell:
type BboxArgs = {
  p_min_lat: number;
  p_min_lng: number;
  p_max_lat: number;
  p_max_lng: number;
};
// Optionale Filter-Args (müssen mit deiner SQL-Funktion korrespondieren)
type ExtraArgs = Partial<{
  p_q: string;
  p_types: Database["public"]["Enums"]["session_type"][];
  p_free_only: boolean;
  p_max_price_cents: number;
  p_from: string;
  p_to: string;
  p_tags: string[];
}>;

type Filters = {
  q: string;
  onlyFreeSeats: boolean;
  types: Database["public"]["Enums"]["session_type"][]; // streng typisiert
  priceMaxEUR: number | null;
  fromISO: string | null;
  toISO: string | null;
  tags: string[];
};

export default function MobileSessionsMap() {
  const mapRef = useRef<MapRef | null>(null);
  const [pins, setPins] = useState<OccurrencePin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<OccurrencePin | null>(null);

  const [viewState, setViewState] = useState<ViewState>({
    longitude: 11.5761,
    latitude: 48.1374,
    zoom: 11,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, left: 0, right: 0, bottom: 0 },
  });

  const [filters, setFilters] = useState<Filters>({
    q: "",
    onlyFreeSeats: false,
    types: [],
    priceMaxEUR: null,
    fromISO: null,
    toISO: null,
    tags: [],
  });

  const fetchPinsByBounds = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    setLoading(true);
    setError(null);

    // Basis-BBOX-Args
    const base: BboxArgs = {
      p_min_lat: bounds.getSouth(),
      p_min_lng: bounds.getWest(),
      p_max_lat: bounds.getNorth(),
      p_max_lng: bounds.getEast(),
    };

    // optionale Filter-Args zusammenbauen
    const extra: ExtraArgs = {
      ...(filters.q.trim() ? { p_q: filters.q.trim() } : {}),
      ...(filters.types.length ? { p_types: filters.types } : {}),
      ...(filters.onlyFreeSeats ? { p_free_only: true } : {}),
      ...(filters.priceMaxEUR != null
        ? { p_max_price_cents: Math.round(filters.priceMaxEUR * 100) }
        : {}),
      ...(filters.fromISO ? { p_from: filters.fromISO } : {}),
      ...(filters.toISO ? { p_to: filters.toISO } : {}),
      ...(filters.tags.length ? { p_tags: filters.tags } : {}),
    };

    // ein einziger RPC-Call
    const { data, error } = await supabase.rpc(
      "find_occurrences_in_bbox",
      { ...base, ...extra } as any // falls TS wegen fehlender Gen-Typen meckert
    );

    if (error) {
      setError(error.message ?? "Fehler beim Laden der Sessions");
      setPins([]);
    } else {
      const rows = (data as OccurrencePin[]).filter(
        (r) => typeof r.lat === "number" && typeof r.lng === "number"
      );
      setPins(rows);
    }

    setLoading(false);
  }, [filters]);

  const debouncedFetch = useMemo(
    () => debounce(fetchPinsByBounds, 350),
    [fetchPinsByBounds]
  );

  // Nach Bewegungsende laden
  const handleMoveEnd = useCallback(() => {
    debouncedFetch();
  }, [debouncedFetch]);

  // Initial laden
  const handleLoad = useCallback(() => {
    fetchPinsByBounds();
  }, [fetchPinsByBounds]);

  // Auf Nutzerzentrum zoomen (einmalig)
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

  // Bei Filteränderungen (debounced) neu laden
  useEffect(() => {
    debouncedFetch();
  }, [filters, debouncedFetch]);

  // UI-Handler
  const toggleType = (t: Database["public"]["Enums"]["session_type"]) =>
    setFilters((f) => ({
      ...f,
      types: f.types.includes(t)
        ? f.types.filter((x) => x !== t)
        : [...f.types, t],
    }));

  return (
    <div className="relative h-dvh w-full">
      <Map
        ref={mapRef}
        mapLib={import("mapbox-gl")}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
        onClick={() => setSelected(null)}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          showUserHeading
        />

        {pins.map((p) => (
          <Marker key={p.occurrence_id} longitude={p.lng!} latitude={p.lat!}>
            <button
              aria-label={`Open ${p.title}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(p);
              }}
              className="grid place-items-center rounded-full bg-white/90 shadow ring-1 ring-black/10"
              style={{ width: 32, height: 32 }}
            >
              <div className="h-2 w-2 rounded-full bg-black" />
            </button>
          </Marker>
        ))}
      </Map>

      {/* Top Filters */}
      <div className="absolute left-0 right-0 top-2 z-10 mx-auto w-[min(680px,95%)] rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
            placeholder="Suche (Titel, Tags)…"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            onBlur={debouncedFetch}
          />

          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={filters.onlyFreeSeats}
              onChange={(e) =>
                setFilters((f) => ({ ...f, onlyFreeSeats: e.target.checked }))
              }
            />
            freie Plätze
          </label>

          <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-2 py-2 text-sm">
            {SESSION_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() =>
                  toggleType(
                    t.key as Database["public"]["Enums"]["session_type"]
                  )
                }
                className={`rounded-lg px-2 py-1 ${
                  filters.types.includes(
                    t.key as Database["public"]["Enums"]["session_type"]
                  )
                    ? "bg-black text-white"
                    : "bg-white text-black border border-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-2 py-2 text-sm">
            <span>≤</span>
            <input
              type="number"
              min={0}
              max={200}
              step={1}
              value={filters.priceMaxEUR ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  priceMaxEUR: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
              placeholder="€"
            />
            <span>€</span>
          </div>

          <input
            type="date"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={filters.fromISO ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, fromISO: e.target.value || null }))
            }
          />
          <input
            type="date"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={filters.toISO ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, toISO: e.target.value || null }))
            }
          />

          <button
            onClick={fetchPinsByBounds}
            className="ml-auto rounded-xl bg-black px-3 py-2 text-sm text-white"
          >
            Anwenden
          </button>
        </div>
      </div>

      {/* Top status pill */}
      <div className="pointer-events-none absolute left-1/2 top-3 translate-y-[52px] -translate-x-1/2">
        <div className="rounded-full bg-black/70 px-3 py-1 text-xs text-white shadow-md">
          {loading ? "Lade Sessions…" : `${pins.length} Sessions im Blick`}
        </div>
      </div>

      {/* Bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-10 transition-transform duration-300 ${
          selected ? "translate-y-0" : "translate-y-[110%]"
        }`}
      >
        <div className="rounded-t-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300" />
          {selected && (
            <div>
              <h3 className="text-base font-semibold leading-tight">
                {selected.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {selected.lat?.toFixed(5)}, {selected.lng?.toFixed(5)}
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/athlete/occ/${selected.occurrence_id}`}
                  className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
                >
                  Details öffnen
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm"
                >
                  Schließen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="pointer-events-none absolute left-1/2 top-[110px] -translate-x-1/2">
          <div className="rounded-md bg-rose-600 px-3 py-2 text-xs text-white shadow-md">
            {error}
          </div>
        </div>
      )}

      {/* No results hint */}
      {!loading && !error && pins.length === 0 && (
        <div className="pointer-events-none absolute left-1/2 bottom-24 -translate-x-1/2 text-center">
          <div className="rounded-md bg-white/90 px-4 py-3 text-xs text-slate-700 shadow">
            Keine Sessions im aktuellen Ausschnitt. Zoome raus oder passe die
            Filter an.
          </div>
        </div>
      )}
    </div>
  );
}
