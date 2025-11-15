// app/(protected)/dashboard/profile/page.tsx
"use client";

import MemberCard from "@/components/profile/MemberCard";
import MotionExpertProfileSettings from "@/components/profile/MotionExpertProfileSettings";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="min-h-[100svh] bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(99,102,241,0.15),transparent),radial-gradient(800px_400px_at_80%_120%,rgba(244,63,94,0.12),transparent)] px-4 sm:px-6">
      <div className="relative flex w-full max-w-md mx-auto justify-center ">
        <div className="absolute flex w-full h-56 bg-white rounded-b-[100px] overflow-hidden">
          <Image
            width={1920}
            height={1080}
            src="/wallet-background-placeholder.png"
            alt="Profile Background"
            className="object-cover object-top w-full h-full rounded-b-[100px] opacity-50"
          />
        </div>
        <div className="relative top-20">
          <MemberCard />
        </div>
      </div>
      <div className="flex w-full max-w-md mx-auto justify-center mt-24 mb-20">
        <MotionExpertProfileSettings />
      </div>
    </div>
  );
}
