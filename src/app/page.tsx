"use client";

import { FAQBlock } from "@/components/FAQ/FaqBlock";
import TestimonialSection from "@/components/UI/Sections/TestiomonialSection";
import AboveTheFoldSection from "@/components/UI/Sections/AboveTheFold";
import MotionExpertsSection from "@/components/UI/Sections/MotionExpertsSection";
import PopularLocationSection from "@/components/UI/Sections/PopularLocationSection";
import CommunitySection from "@/components/UI/Sections/CommunitySection";
import CallToActionSection from "@/components/UI/Sections/CallToActionSection";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <AboveTheFoldSection />
      <div className="flex w-full h-20" />
      <MotionExpertsSection />
      <div className="flex w-full h-20" />
      <PopularLocationSection />
      <div className="flex w-full h-20" />
      <CommunitySection />
      <div className="flex w-full h-20" />
      <TestimonialSection />
      <div className="flex w-full h-20" />
      <CallToActionSection />
      <div className="flex w-full h-20" />
      <FAQBlock />
    </div>
  );
}
