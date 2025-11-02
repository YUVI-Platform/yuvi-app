"use client";

import { useEffect, useState } from "react";
import { StudioCard } from "@/components/ui/Cards/StudioCards";
import { fetchAllStudios } from "@/utils/supabase/getStudios";
import { StudioProps } from "@/Types/Studio";
import dayjs from "dayjs";
import "dayjs/locale/de";
dayjs.locale("de");

export default function MyStudiosPage() {
  return <MyStudios />;
}

const MyStudios = () => {
  const [studios, setStudios] = useState<StudioProps[] | null>(null);

  useEffect(() => {
    const loadStudios = async () => {
      const data = await fetchAllStudios();
      setStudios(data);
    };
    loadStudios();
  }, []);

  console.log("Studios data:", JSON.stringify(studios));
  return (
    <div className="w-full h-full py-10">
      <div className="w-full grid grid-cols-4 gap-10">
        {studios
          ? studios.map((studio) => (
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
            ))
          : [...Array(4)].map((_, i) => <StudioCardSkeleton key={i} />)}
      </div>
    </div>
  );
};

const StudioCardSkeleton = () => (
  <div className="animate-pulse flex flex-col space-y-4 p-4 border border-gray-200 rounded-xl shadow-sm">
    <div className="bg-gray-200 h-48 w-full rounded-lg"></div>
    <div className="bg-gray-200 h-6 w-3/4 rounded-md"></div>
    <div className="bg-gray-200 h-4 w-1/2 rounded-md"></div>
    <div className="bg-gray-200 h-4 w-1/3 rounded-md"></div>
  </div>
);
