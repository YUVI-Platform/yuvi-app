import { CourseLocationProps } from "@/Types/Location";
import Image from "next/image";
import { Star } from "feather-icons-react";
import { Wifi, Speaker } from "feather-icons-react";

export const CourseLocationCard = ({
  name,
  address,
  size,
  availableFrom,
  availableTo,
  features,
  rating,
  imageUrl,
}: CourseLocationProps) => {
  return (
    <div className="flex flex-col w-72 h-72 overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-md cursor-pointer hover:shadow-lg transition-all hover:scale-105">
      <div className="flex w-full h-1/2 overflow-hidden justify-center items-center bg-indigo-400">
        <Image
          src={imageUrl}
          alt="Location Placeholder"
          width={300}
          height={200}
          style={{ objectFit: "cover" }}
          className="w-full h-auto"
        />
      </div>
      <div className="flex flex-col w-full h-1/2 overflow-hidden p-4 gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold gelasio overflow-hidden text-ellipsis whitespace-nowrap ">
            {name}
          </h3>
          <div className="flex items-center gap-1">
            <Star
              className=""
              stroke="#fee685"
              fill="#fee685"
              size={18}
              strokeWidth={1.5}
            />
            <Star
              className=""
              stroke="#fee685"
              fill="#fee685"
              size={18}
              strokeWidth={1.5}
            />
            <Star
              className=""
              stroke="#fee685"
              fill="#fee685"
              size={18}
              strokeWidth={1.5}
            />
            <Star
              className=""
              stroke="#fee685"
              fill="#fee685"
              size={18}
              strokeWidth={1.5}
            />
            <Star
              className=""
              stroke="#fee685"
              fill="transparent"
              size={18}
              strokeWidth={1.5}
            />
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
            {features.includes("WiFi") && (
              <Wifi className="" size={16} strokeWidth={2} />
            )}
            {features.includes("Sound") && (
              <Speaker className="" size={16} strokeWidth={2} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
