import { StudioCard } from "../../UI/Cards/StudioCards";
import { StudioProps } from "@/Types/Studio";

export type CourseLocationType = "custom" | "fromList";

import { useEffect, useState } from "react";
// import { MultiStateButton } from "../../UI/MultiStateButton";
import { fetchAllStudios } from "@/utils/supabase/getStudios";
import dayjs from "dayjs";

export const CourseLocationStep = () => {
  const [selectedLocation, setSelectedLocation] = useState<StudioProps | null>(
    null
  );
  // const [showMap, setShowMap] = useState(true);
  const [studios, setStudios] = useState<StudioProps[] | null>(null);

  useEffect(() => {
    const loadStudios = async () => {
      const data = await fetchAllStudios();
      setStudios(data);
    };
    loadStudios();
  }, []);

  return (
    <div className="grid grid-cols-1 justify-items-center gap-8 text-indigo-400">
      <h2 className="text-2xl font-bold">Finde deinen passenden Host!</h2>
      {/* <MultiStateButton
        labels={["Liste", "Karte"]}
        onChange={() => setShowMap(!showMap)}
      /> */}
      <div className="relative  w-fit h-fit max-h-[500px] rounded-2xl overflow-hidden">
        {/* {showMap && (
          <> */}
        <div className="relative grid grid-cols-2 justify-items-center max-h-[500px] overflow-y-scroll gap-8 overflow-box-scroll-hidden p-10">
          {studios?.map((studio) => (
            <div
              key={studio.name}
              className={
                studio === selectedLocation
                  ? "border-3 border-yuvi-rose bg-yuvi-rose rounded-2xl overflow-hidden"
                  : ""
              }
              onClick={() => setSelectedLocation(studio)}
            >
              <StudioCard
                key={`${studio.user_id ?? "unknown"}-${studio.studio_name}-${
                  studio.studio_address?.street ?? "noaddress"
                }`}
                name={studio.studio_name || "Loading..."}
                address={`${studio.studio_address?.street ?? "Loading..."}
                         `}
                size={studio.studio_size ? `${studio.studio_size} m²` : "N/A"}
                availableFrom={
                  dayjs(studio.availability?.startDate).format("MMMYY") || "N/A"
                }
                availableTo={
                  dayjs(studio.availability?.endDate).format("MMMYY") || "N/A"
                }
                features={studio.amenities || []}
                rating={studio.ratings?.stars || 0}
                imageUrl={
                  studio.image_previews
                    ? studio.image_previews[0]
                    : "/placeholder.jpg"
                }
              />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent z-10" />
        {/* </>
        )} */}
      </div>
      {/* <span>{selectedLocation?.name}</span> */}
    </div>
  );
};

// const testCourseLocation: StudioProps[] = [
//   {
//     name: "Helles Loftstudio",
//     address: "Beispielstraße 123",
//     size: "50m²",
//     availableFrom: "Feb.25",
//     availableTo: "Mar.26, 2025",
//     features: ["WiFi", "Sound"],
//     rating: 3,
//     imageUrl: "/location-test-image.jpg",
//   },
//   {
//     name: "Urban Fitness Garage",
//     address: "Urbanstraße 45",
//     size: "65m²",
//     availableFrom: "Jan.10",
//     availableTo: "Dec.20, 2025",
//     features: ["WiFi"],
//     rating: 4,
//     imageUrl: "/2-location-test-image.webp",
//   },
//   {
//     name: "Rooftop Gym",
//     address: "Hochhausallee 9",
//     size: "80m²",
//     availableFrom: "Apr.01",
//     availableTo: "Sep.30, 2025",
//     features: ["WiFi", "Sound"],
//     rating: 5,
//     imageUrl: "/3-location-test-image.webp",
//   },
//   {
//     name: "Cozy Yoga Space",
//     address: "Entspannungsweg 77",
//     size: "40m²",
//     availableFrom: "Mar.15",
//     availableTo: "Nov.15, 2025",
//     features: ["WiFi"],
//     rating: 4,
//     imageUrl: "/4-location-test-image.jpg",
//   },
//   {
//     name: "Helles Loftstudio",
//     address: "Beispielstraße 123",
//     size: "50m²",
//     availableFrom: "Feb.25",
//     availableTo: "Mar.26, 2025",
//     features: ["WiFi", "Sound"],
//     rating: 3,
//     imageUrl: "/location-test-image.jpg",
//   },
//   {
//     name: "Urban Fitness Garage",
//     address: "Urbanstraße 45",
//     size: "65m²",
//     availableFrom: "Jan.10",
//     availableTo: "Dec.20, 2025",
//     features: ["WiFi", "Sound"],
//     rating: 4,
//     imageUrl: "/2-location-test-image.webp",
//   },
//   {
//     name: "Rooftop Gym",
//     address: "Hochhausallee 9",
//     size: "80m²",
//     availableFrom: "Apr.01",
//     availableTo: "Sep.30, 2025",
//     features: ["Sound"],
//     rating: 5,
//     imageUrl: "/3-location-test-image.webp",
//   },
//   {
//     name: "Cozy Yoga Space",
//     address: "Entspannungsweg 77",
//     size: "40m²",
//     availableFrom: "Mar.15",
//     availableTo: "Nov.15, 2025",
//     features: ["WiFi"],
//     rating: 4,
//     imageUrl: "/4-location-test-image.jpg",
//   },
// ];
