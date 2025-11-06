import { motionExpertTestData } from "@/testdata/motionExpertData";
import React from "react";
import Image from "next/image";

const MotionExpertsSection = () => {
  const randomIndex = Math.floor(Math.random() * 4);
  const randomExperts = motionExpertTestData.sort(() => 0.5 - Math.random());
  const expert = randomExperts[0];

  return (
    <section className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
      {/* Headline */}
      <div className="text-center mb-8 sm:mb-12">
        <h3 className="text-base sm:text-lg text-slate-700 mb-2 sm:mb-3">
          Unsere Motion-Experts
        </h3>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-indigo-400">
          Triff unsere Community!
        </h2>
      </div>

      {/* Hero: Bild + Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 mb-10 sm:mb-16">
        {/* Großes Bild */}
        <div className="relative w-full rounded-xl overflow-hidden bg-indigo-200">
          <Image
            src={expert.imageUrl || "/character_placeholder_img.png"}
            alt={expert.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Reviews */}
        <div className="hidden md:flex flex-col gap-4 sm:gap-6">
          {expert.customerReviews?.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-indigo-50 shadow-sm sm:shadow-md"
            >
              <p className="text-slate-600 p-4 sm:p-5 text-base sm:text-lg line-clamp-4">
                {review.reviewText}
              </p>

              <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 pb-4">
                <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-indigo-100">
                  <Image
                    src={
                      expert.customerReviews?.[index]?.reviewerImageUrl ||
                      "/character_placeholder_img.png"
                    }
                    alt={review.reviewerName || "Reviewer"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <span className="text-indigo-400 text-base sm:text-lg font-medium">
                  {review.reviewerName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info + Trainingsbild */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 lg:gap-16">
        {/* Textseite */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-slate-900">
            Lerne Motion-Expert:in{" "}
            <span className="underline text-indigo-500 decoration-indigo-500 underline-offset-4">
              {expert.name.split(" ")[0]}
            </span>{" "}
            kennen!
          </h2>

          <p className="text-slate-600 text-base sm:text-lg">
            {expert.description}
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {expert.specialties
              .filter(Boolean)
              .slice(0, 5)
              .map((specialty) => (
                <span
                  key={specialty}
                  className="py-1.5 px-3 bg-slate-100 rounded-full text-slate-500 text-sm sm:text-base max-w-[11rem] truncate"
                  title={specialty}
                >
                  {specialty}
                </span>
              ))}
          </div>
        </div>

        {/* Trainingsbild */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-indigo-100">
          <Image
            src={
              expert.trainingsImageUrlArray?.[randomIndex] ||
              "/character_placeholder_img.png"
            }
            alt={`Training von ${expert.name}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default MotionExpertsSection;
