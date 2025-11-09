// src/server/geocode.ts
import "server-only";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN; // Server-Env, nicht NEXT_PUBLIC

export async function geocodeAddress(addr: {
  street: string;
  zip: string;
  city: string;
  country: string;
}): Promise<{ lat: number; lng: number } | null> {
  const q = encodeURIComponent(
    `${addr.street}, ${addr.zip} ${addr.city}, ${addr.country}`
  );

  // Mapbox zuerst
  if (MAPBOX_TOKEN) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?limit=1&autocomplete=false&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const feat = data?.features?.[0];
    if (!feat?.center?.length) return null;
    const [lng, lat] = feat.center;
    return { lat, lng };
  }

  // Fallback: Nominatim (Rate Limits beachten)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
    {
      headers: { "User-Agent": "yuvi-app/1.0 (contact@example.com)" },
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  const arr = await res.json();
  if (!arr?.[0]) return null;
  return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
}
