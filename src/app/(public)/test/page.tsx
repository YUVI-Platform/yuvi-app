export default function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">
        This is a test page for experimenting with components and features.
      </p>
      <p className="text-sm text-gray-500">
        You can add your test components or code snippets here.
      </p>
    </div>
  );
}
// "use client";

// import dynamic from "next/dynamic";
// import { useState } from "react";

// // v7-Importpfad:
// const Map = dynamic(
//   () => import("react-map-gl/mapbox").then((m) => m.default),
//   { ssr: false }
// );
// const Marker = dynamic(
//   () => import("react-map-gl/mapbox").then((m) => m.Marker),
//   { ssr: false }
// );
// const NavigationControl = dynamic(
//   () => import("react-map-gl/mapbox").then((m) => m.NavigationControl),
//   { ssr: false }
// );

// type MarkerPoint = {
//   id: string;
//   lat: number;
//   lng: number;
//   label?: string;
//   altitude?: number | null;
// };

// export default function LocationPickerPro() {
//   const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

//   const [address, setAddress] = useState("");
//   const [lat, setLat] = useState<number | null>(null);
//   const [lng, setLng] = useState<number | null>(null);
//   const [markers, setMarkers] = useState<MarkerPoint[]>([]);
//   const [addOnClick, setAddOnClick] = useState(false);

//   const [viewState, setViewState] = useState({
//     longitude: 11.576124, // München
//     latitude: 48.137154,
//     zoom: 12,
//   });

//   // Adresse -> Geocoding -> lat/lng + Marker
//   const geocodeAddress = async () => {
//     if (!address.trim()) return;
//     try {
//       // Eigene Server-Route, siehe API-Beispiel weiter unten
//       const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`, {
//         cache: "no-store",
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       const feat = data?.features?.[0];
//       if (!feat) return;

//       const [gLng, gLat] = feat.center;
//       setLat(gLat);
//       setLng(gLng);
//       setViewState((v) => ({
//         ...v,
//         longitude: gLng,
//         latitude: gLat,
//         zoom: Math.max(v.zoom, 14),
//       }));

//       // Optional: Höhe ermitteln (siehe API unten)
//       const altitude = await fetchAltitudeSafe(gLat, gLng);

//       addMarker({ lat: gLat, lng: gLng, label: feat.text, altitude });
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const addMarker = (p: {
//     lat: number;
//     lng: number;
//     label?: string;
//     altitude?: number | null;
//   }) => {
//     setMarkers((prev) => [
//       ...prev,
//       { id: `${Date.now()}-${prev.length}`, ...p },
//     ]);
//   };

//   // Marker an Kartenzentrum
//   const addMarkerAtCenter = async () => {
//     const { latitude, longitude } = viewState as any;
//     const altitude = await fetchAltitudeSafe(latitude, longitude);
//     addMarker({ lat: latitude, lng: longitude, label: "Center", altitude });
//     setLat(latitude);
//     setLng(longitude);
//   };

//   // Nächster Klick setzt Marker
//   const onMapClick = async (e: any) => {
//     if (!addOnClick) return;
//     const { lat, lng } = e.lngLat;
//     const altitude = await fetchAltitudeSafe(lat, lng);
//     addMarker({ lat, lng, label: "Klick", altitude });
//     setLat(lat);
//     setLng(lng);
//     setAddOnClick(false);
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//       {/* Formular */}
//       <div className="space-y-3">
//         <label className="block text-sm font-medium">Adresse</label>
//         <div className="flex gap-2">
//           <input
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//             placeholder="Straße, Stadt…"
//             className="w-full border rounded-md p-2"
//           />
//           <button
//             type="button"
//             onClick={geocodeAddress}
//             className="px-3 py-2 rounded-md bg-indigo-600 text-white"
//           >
//             Suchen
//           </button>
//         </div>

//         <div className="grid grid-cols-2 gap-2">
//           <div>
//             <label className="block text-sm">Latitude</label>
//             <input
//               value={lat ?? ""}
//               onChange={(e) => setLat(safeNum(e.target.value))}
//               placeholder="48.13715"
//               className="w-full border rounded-md p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm">Longitude</label>
//             <input
//               value={lng ?? ""}
//               onChange={(e) => setLng(safeNum(e.target.value))}
//               placeholder="11.57612"
//               className="w-full border rounded-md p-2"
//             />
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-2">
//           <button
//             type="button"
//             onClick={addMarkerAtCenter}
//             className="px-3 py-2 rounded-md border"
//           >
//             Marker an Kartenzentrum
//           </button>
//           <button
//             type="button"
//             onClick={() => setAddOnClick((v) => !v)}
//             className={`px-3 py-2 rounded-md border ${
//               addOnClick ? "bg-yellow-200" : ""
//             }`}
//           >
//             {addOnClick
//               ? "Klick-Modus aktiv: nächster Klick setzt Marker"
//               : "Beim nächsten Klick Marker setzen"}
//           </button>
//           <button
//             type="button"
//             onClick={() => setMarkers([])}
//             className="px-3 py-2 rounded-md border"
//           >
//             Marker leeren
//           </button>
//         </div>

//         <div className="text-xs text-gray-500">
//           Gespeicherte Marker: {markers.length}
//           <ul className="list-disc ml-5 mt-1">
//             {markers.map((m) => (
//               <li key={m.id}>
//                 {m.label ?? "Marker"} — lat {m.lat.toFixed(5)}, lng{" "}
//                 {m.lng.toFixed(5)}
//                 {typeof m.altitude === "number"
//                   ? `, alt ${m.altitude.toFixed(1)} m`
//                   : ""}
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* Karte */}
//       <div className="relative h-72 lg:h-96 rounded-md overflow-hidden border">
//         <Map
//           {...viewState}
//           onMove={(evt: any) => setViewState(evt.viewState)}
//           onClick={onMapClick}
//           mapStyle="mapbox://styles/mapbox/streets-v12"
//           mapboxAccessToken={token}
//           style={{ width: "100%", height: "100%" }}
//         >
//           <NavigationControl position="top-left" />
//           {markers.map((m) => (
//             <Marker
//               key={m.id}
//               latitude={m.lat}
//               longitude={m.lng}
//               anchor="bottom"
//             >
//               <div className="relative">
//                 <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow" />
//                 {m.label && (
//                   <span className="absolute left-3 -top-1 text-xs bg-white/80 px-1 rounded">
//                     {m.label}
//                   </span>
//                 )}
//               </div>
//             </Marker>
//           ))}
//         </Map>
//       </div>
//     </div>
//   );
// }

// // Hilfsfunktionen
// function safeNum(v: string): number | null {
//   const n = parseFloat(v);
//   return Number.isFinite(n) ? n : null;
// }

// // OPTIONAL: Höhe ermitteln – implementiere dir eine Server-Route, die einen Höhenservice aufruft.
// // Hier nur „freundliches Fallback“, damit die UI nicht crasht, wenn du noch keine Höhe willst.
// async function fetchAltitudeSafe(
//   lat: number,
//   lng: number
// ): Promise<number | null> {
//   try {
//     const r = await fetch(`/api/elevation?lat=${lat}&lng=${lng}`, {
//       cache: "no-store",
//     });
//     if (!r.ok) return null;
//     const data = await r.json();
//     return typeof data?.elevation === "number" ? data.elevation : null;
//   } catch {
//     return null;
//   }
// }
