"use client";

import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import { CourseLocationCard } from "../../../components/UI/Cards/LocationCards";
import { MultiStateButton } from "../../../components/UI/MultiStateButton";

const locations = [
  {
    id: 1,
    name: "Studio Schwabing",
    address: "Leopoldstr. 50, 80802 München",
    size: "60 m²",
    availableFrom: "08:00",
    availableTo: "20:00",
    features: ["WiFi", "Sound"],
    rating: 4,
    imageUrl: "/locations/schwabing.jpg",
    longitude: 11.582,
    latitude: 48.159,
  },
  {
    id: 2,
    name: "Fitnesspark Ostpark",
    address: "St.-Veit-Str. 10, 81673 München",
    size: "100 m²",
    availableFrom: "07:00",
    availableTo: "22:00",
    features: ["WiFi"],
    rating: 5,
    imageUrl: "/locations/ostpark.jpg",
    longitude: 11.6332,
    latitude: 48.1158,
  },
  {
    id: 3,
    name: "Theresienwiese Spot",
    address: "Theresienhöhe, 80339 München",
    size: "80 m²",
    availableFrom: "09:00",
    availableTo: "18:00",
    features: ["Sound"],
    rating: 3,
    imageUrl: "/locations/theresienwiese.jpg",
    longitude: 11.5454,
    latitude: 48.1316,
  },
  {
    id: 4,
    name: "Englischer Garten Mitte",
    address: "Englischer Garten, 80538 München",
    size: "90 m²",
    availableFrom: "06:00",
    availableTo: "20:00",
    features: ["WiFi", "Sound"],
    rating: 4,
    imageUrl: "/locations/egarten.jpg",
    longitude: 11.603,
    latitude: 48.1499,
  },
  {
    id: 5,
    name: "Westpark Süd",
    address: "Westendstr. 305, 81377 München",
    size: "70 m²",
    availableFrom: "10:00",
    availableTo: "21:00",
    features: [],
    rating: 4,
    imageUrl: "/locations/westpark.jpg",
    longitude: 11.5111,
    latitude: 48.1235,
  },
];

export default function MapWithSidebar() {
  const [showMap, setShowMap] = useState(true);
  const [viewState, setViewState] = useState({
    longitude: 11.576124,
    latitude: 48.137154,
    zoom: 12,
  });

  return (
    <main className="flex h-screen overflow-hidden w-full">
      {/* Sidebar mit Cards */}
      <div className="min-w-fit h-full overflow-y-scroll bg-white p-8 space-y-4">
        {locations.map((loc) => (
          <CourseLocationCard
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
      {/* Map */}
      <div className="w-full h-full relative">
        <MultiStateButton
          labels={["Liste", "Karte"]}
          onChange={() => setShowMap(!showMap)}
        />
        <Map
          {...viewState}
          mapboxAccessToken={
            "pk.eyJ1IjoiaG0tc2FuY2hlejAiLCJhIjoiY205cGhzN3d2MDY4YjJpc2ZhNW1kYnE5ayJ9.J4ptmlkfcxnLUDmQ6sBcVg"
          }
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/light-v11"
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="top-left" />
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              longitude={loc.longitude}
              latitude={loc.latitude}
              anchor="bottom"
            >
              <div className="w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-lg" />
            </Marker>
          ))}
        </Map>
      </div>
    </main>
  );
}
