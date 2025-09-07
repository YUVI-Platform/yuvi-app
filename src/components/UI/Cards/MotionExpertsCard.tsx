import { StarRating } from "./StarRating";
import Image from "next/image";
import React from "react";

const MotionExpertsCard = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl h-fit shadow-lg w-80 hover:scale-105 transition-transform duration-300 bg-white cursor-pointer">
      <div className="flex justify-center items-center bg-indigo-200  h-40overflow-hidden">
        <Image
          src="/character_placeholder_img.png"
          alt="Trainer Name"
          width={200}
          height={200}
        />
      </div>
      <div className="flex gap-4 p-2 justify-between w-80">
        <h3 className="text-xl font-bold text-indigo-400 w-36 overflow-ellipsis whitespace-nowrap overflow-hidden flex-shrink-0">
          Maxi MusterFrau
        </h3>
        <StarRating rating={5} />
      </div>
      <div className="w-full  p-2">
        <p className="text-gray-400 line-clamp-3 overflow-hidden">
          Ein Erfahrener Trainer mit über 10 Jahren Erfahrung in Bodyweight
          Training.
        </p>
      </div>
      <div className="flex gap-2 p-2">
        <span className="py-1 px-3 bg-gray-300 rounded-full text-gray-400">
          Cross-Fit
        </span>
        <span className="py-1 px-3 bg-gray-300 rounded-full text-gray-400">
          Yoga
        </span>
        <span className="py-1 px-3 bg-gray-300 rounded-full text-gray-400">
          Pilates
        </span>
      </div>
    </div>
  );
};

export default MotionExpertsCard;
