"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export const ImagePreviewCarousel = ({
  imagePreviews,
}: {
  imagePreviews: string[];
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="w-full overflow-hidden flex flex-col items-center gap-4">
      <div className="relative max-h-[300px]">
        <Image
          src={imagePreviews[currentIndex]}
          alt={`Preview ${currentIndex}`}
          className="w-full object-cover aspect-video"
          width={1280}
          height={720}
        />
        <button
          onClick={() =>
            setCurrentIndex(
              (prev) => (prev - 1 + imagePreviews.length) % imagePreviews.length
            )
          }
          className="absolute top-1/2 left-2 bg-white text-gray-800 text-xl px-3 py-1 rounded opacity-70 hover:opacity-100"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev + 1) % imagePreviews.length)
          }
          className="absolute top-1/2 right-2 bg-white text-gray-800 text-xl px-3 py-1 rounded opacity-70 hover:opacity-100"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
