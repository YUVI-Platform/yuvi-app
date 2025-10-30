"use client";

import AboutYuviSection from "@/components/landing-page/AboutYuviSection";
import FAQSection from "@/components/landing-page/FAQSection";
import FeatureSection from "@/components/landing-page/FeatureSection";
import HeroSection from "@/components/landing-page/HeroSection";
import TeamMagicCardsSection from "@/components/landing-page/TeamMagicCardsSection";
// import AboveTheFoldSection from "@/components/UI/Sections/AboveTheFold";
// import MotionExpertsSection from "@/components/UI/Sections/MotionExpertsSection";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full overflow-hidden">
      <HeroSection />
      <TeamMagicCardsSection />
      <AboutYuviSection />
      <FeatureSection />
      <FAQSection />

      {/* <MotionExpertsSection /> */}
      {/* 
      <div className="flex w-full h-20" />
      <div className="flex w-full h-20" />
      <PopularLocationSection />
      <div className="flex w-full h-20" />
      <CommunitySection />
      <div className="flex w-full h-20" />
      <TestimonialSection />
      <div className="flex w-full h-20" />
      <CallToActionSection />
      <div className="flex w-full h-20" />
      <FAQBlock /> */}
    </div>
  );
}
