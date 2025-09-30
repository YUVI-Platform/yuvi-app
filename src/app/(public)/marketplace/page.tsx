"use client";

import dynamic from "next/dynamic";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import { StudioCard } from "@/components/UI/Cards/StudioCards";
import { MultiStateButton } from "@/components/UI/MultiStateButton";
import { locations } from "@/testdata/locationData";

// Map ohne SSR laden (wichtig für Next.js)
const Map = dynamic(
  () => import("react-map-gl/mapbox").then((m) => m.default),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-map-gl/mapbox").then((m) => m.Marker),
  { ssr: false }
);
const NavigationControl = dynamic(
  () => import("react-map-gl/mapbox").then((m) => m.NavigationControl),
  { ssr: false }
);

export default function MapWithSidebar() {
  // showMap = true => Karte (mobil)
  const [showMap, setShowMap] = useState(true);
  const [viewState, setViewState] = useState({
    longitude: 11.576124,
    latitude: 48.137154,
    zoom: 12,
  });

  return (
    <main className="flex flex-col md:flex-row w-full md:h-screen overflow-hidden pt-20">
      {/* Toggle nur für Mobile sichtbar */}
      <div className="md:hidden flex justify-center py-3">
        <MultiStateButton
          labels={["Liste", "Karte"]}
          // falls dein Button "links = true" liefert: bei "Liste" => showMap = false
          onChange={(isLeftActive) => setShowMap(!isLeftActive)}
        />
      </div>

      {/* Liste: mobil nur wenn showMap=false, ab md immer sichtbar */}
      <div
        className={[
          "flex flex-col p-4 md:p-8 space-y-4 overflow-y-auto",
          "md:min-w-[380px] md:max-w-[480px] md:border-r md:border-neutral-200",
          showMap ? "hidden md:flex" : "flex",
        ].join(" ")}
        style={{ maxHeight: "calc(100vh - 5rem)" }} // 5rem ~ pt-20
      >
        {locations.map((loc) => (
          <StudioCard
            key={loc.id}
            name={loc.name}
            address={loc.address}
            size={loc.size}
            availableFrom={loc.availableFrom}
            availableTo={loc.availableTo}
            features={loc.features}
            rating={loc.rating}
            imageUrl={loc.imageUrl}
          />
        ))}
      </div>

      {/* Karte: mobil nur wenn showMap=true, ab md immer sichtbar */}
      <div
        className={[
          "relative flex-1",
          showMap ? "block" : "hidden md:block",
        ].join(" ")}
        style={{ height: "calc(100vh - 5rem)" }} // 5rem ~ pt-20
      >
        <Map
          initialViewState={viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN} // pack den Token in .env
          style={{ width: "100%", height: "100%" }}
        >
          <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
            <NavigationControl />
          </div>
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              longitude={loc.longitude}
              latitude={loc.latitude}
            >
              <div className="w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-lg" />
            </Marker>
          ))}
        </Map>
      </div>
    </main>
  );
}
