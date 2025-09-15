import { StarRating } from "./StarRating";
import Image from "next/image";
import React from "react";

export interface MotionExpertCardProps {
  name: string;
  rating: number;
  description: string;
  specialties: string[];
  imageUrl?: string;
}
const MotionExpertsCard = ({
  name,
  rating,
  description,
  specialties,
  imageUrl,
}: MotionExpertCardProps) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl h-fit shadow-lg w-80 hover:scale-105 transition-transform duration-300 bg-white cursor-pointer">
      <div className="flex justify-center items-center bg-indigo-200 overflow-hidden aspect-video">
        <Image
          src={imageUrl ? imageUrl : "/character_placeholder_img.png"}
          alt="Trainer Name"
          width={200}
          height={200}
        />
      </div>
      <div className="flex gap-4 p-2 justify-between w-80">
        <h3 className="text-xl font-bold text-indigo-400 w-36 overflow-ellipsis whitespace-nowrap overflow-hidden flex-shrink-0">
          {name}
        </h3>
        <StarRating rating={rating} />
      </div>
      <div className="w-full  p-2">
        <p className="text-gray-400 line-clamp-3 overflow-hidden">
          {description}
        </p>
      </div>
      <div className="flex gap-2 p-2">
        {specialties
          .filter((specialty) => !!specialty)
          .slice(0, 3)
          .map((specialty) => (
            <span
              key={specialty}
              className="py-1 px-3 bg-gray-300 rounded-full text-gray-400 overflow-ellipsis whitespace-nowrap overflow-hidden text-sm max-w-24"
            >
              {specialty}
            </span>
          ))}
      </div>
    </div>
  );
};

export default MotionExpertsCard;
