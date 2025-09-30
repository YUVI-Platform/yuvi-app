import { StudioCardProps } from "@/Types/Studio";
import {
  ShowerHeadIcon,
  ParkingSquareIcon,
  ToiletIcon,
  BlindsIcon,
  SpotlightIcon,
} from "lucide-react";
import Image from "next/image";

import { Wifi, Speaker } from "feather-icons-react";
import { StarRating } from "./StarRating";

export const StudioCard = ({
  name,
  address,
  size,
  availableFrom,
  availableTo,
  features,
  rating,
  imageUrl,
}: StudioCardProps) => {
  console.log("Image URL:", imageUrl);
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl h-fit shadow-lg w-full md:w-80 hover:scale-105 transition-transform duration-300 bg-white cursor-pointer">
      <div className="flex justify-center items-center bg-indigo-200 overflow-hidden aspect-video">
        <Image
          src={imageUrl}
          alt="Location Placeholder"
          width={400}
          height={400}
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="flex flex-col w-full h-1/2 overflow-hidden p-4 gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold  overflow-hidden text-ellipsis whitespace-nowrap ">
            {name}
          </h3>
          <div className="flex items-center gap-1">
            <StarRating rating={rating} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-400 w-fit rounded-full px-2 py-1 text-emerald-700 text-xs font-semibold">
            Available
          </span>
          <span className="text-sm text-slate-500">
            {availableFrom} - {availableTo}
          </span>
        </div>
        <p className="text-sm text-slate-500">{address}</p>
        <div className="flex items-center gap-4 text-slate-500">
          <span>{size}</span>
          <div className="flex items-center gap-4">
            {features.includes("Wifi") && (
              <Wifi className="" size={16} strokeWidth={2} />
            )}
            {features.includes("Soundanlage") && (
              <Speaker className="" size={16} strokeWidth={2} />
            )}
            {features.includes("Dusche") && (
              <ShowerHeadIcon className="text-slate-500" size={16} />
            )}
            {features.includes("Parkplatz") && (
              <ParkingSquareIcon className="text-slate-500" size={16} />
            )}
            {features.includes("WC") && (
              <ToiletIcon className="text-slate-500" size={16} />
            )}
            {features.includes("Umkleide") && (
              <BlindsIcon className="text-slate-500" size={16} />
            )}
            {features.includes("Lichtanlage") && (
              <SpotlightIcon className="text-slate-500" size={16} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
