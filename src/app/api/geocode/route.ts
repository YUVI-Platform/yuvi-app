import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ features: [] });

  const token =
    process.env.MAPBOX_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      q
    )}.json` + `?access_token=${token}&autocomplete=true&limit=5&language=de`;

  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json();
  return NextResponse.json(data);
}
