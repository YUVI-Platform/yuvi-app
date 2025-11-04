"use client";
import { ImagePreviewCarousel } from "../Images/ImagePreviewCarousel";
import { fetchAllStudios } from "@/utils/supabase/getStudios";

import { useEffect, useState } from "react";

import { StudioProps } from "@/Types/Studio";

// alt: import { StarRating } from "../ui/Cards/StarRating";
import StarRating from "../ui/Cards/StarRating";
// neu:

// export interface StudioProps {
//   name: string;
//   uploaded_files?: File[];
//   image_previews?: string[];
//   studio_name?: string;
//   studio_address?: {
//     street?: string;
//     city?: string;
//     zip?: string;
//     country?: string;
//   };
//   studio_size?: number;
//   studio_description?: string;
//   amenities?: string[];
//   availability?: {
//     startDate?: string;
//     endDate?: string;
//     weeklySchedule?: { day: string; from: string; to: string }[];
//   };
//   ratings?: {
//     stars?: number;
//     reviews?: string[];
//   };

//   user_id?: string;
// }

const StudioPreview = () => {
  const [studios, setStudios] = useState<StudioProps[]>([]);

  useEffect(() => {
    fetchAllStudios().then((data) => {
      setStudios(data);
    });
  }, []);

  console.log("Studios in StudioPreview:", studios);

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl shadow-md w-full h-fit max-w-3xl overflow-hidden">
      <div className="w-full h-fit">
        <ImagePreviewCarousel
          imagePreviews={
            studios[0]?.image_previews && studios[0].image_previews.length > 0
              ? studios[0].image_previews
              : ["/landingpage-placeholder.avif"]
          }
        />
      </div>
      <div className="flex flex-col gap-2 p-4 w-full">
        <div className="flex justify-between w-full gap-2">
          <h1 className="text-4xl font-bold">
            {studios[0] ? studios[0]?.studio_name : "Studio Name"}
          </h1>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {studios?.[0]?.studio_name ?? "Studio"}
            </h1>
            <StarRating value={studios?.[0]?.ratings?.stars ?? 4.5} />
          </div>
        </div>
        <p>
          {studios[0] ? studios[0]?.studio_description : "Studio Description"}
        </p>

        <p>
          Reviews:{" "}
          {studios[0] &&
          studios[0]?.ratings?.reviews &&
          studios[0].ratings.reviews.length > 0
            ? studios[0].ratings.reviews.length + " reviews"
            : "Noch keine Bewertungen"}
        </p>

        <p>Price: {studios[0] ? studios[0]?.price : "$50"} per session</p>
        <p>
          Location:{" "}
          {studios[0] && studios[0]?.studio_address
            ? [
                studios[0].studio_address.street,
                studios[0].studio_address.city,
                studios[0].studio_address.zip,
                studios[0].studio_address.country,
              ]
                .filter(Boolean)
                .join(", ")
            : "Studio Address"}
        </p>

        <p>
          Availability:{" "}
          {studios[0] && studios[0]?.availability
            ? studios[0].availability.weeklySchedule
              ? studios[0].availability.weeklySchedule
                  .map((slot) => `${slot.day}: ${slot.from} - ${slot.to}`)
                  .join(", ")
              : "Availability info not provided"
            : "Mon-Fri, 9am-5pm"}
        </p>
        <p>
          Amenities:{" "}
          {studios[0] ? studios[0]?.amenities : "Free Wi-Fi, Parking available"}
        </p>

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default StudioPreview;
