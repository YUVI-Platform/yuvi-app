import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  if (!lat || !lng) return NextResponse.json({ elevation: null });

  // Achtung: Externer Free-Service – in Produktion ggf. eigenen Proxy/Quota einplanen
  const url = `https://api.opentopodata.org/v1/eudem25m?locations=${lat},${lng}`;

  try {
    const r = await fetch(url, { cache: "no-store" });
    const data = await r.json();
    const elevation = data?.results?.[0]?.elevation ?? null;
    return NextResponse.json({ elevation });
  } catch {
    return NextResponse.json({ elevation: null });
  }
}
