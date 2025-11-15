// app/(protected)/dashboard/profile/page.tsx
"use client";

import AthleteProfileSettings from "@/components/profile/AthleteProfileSettings";
import MemberCard from "@/components/profile/MemberCard";

import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="min-h-[100svh]">
      <div className="flex w-full max-w-md mx-auto justify-center ">
        <div className="absolute flex w-full h-56 bg-white rounded-b-[100px] overflow-hidden">
          <Image
            width={1920}
            height={1080}
            src="/wallet-background-placeholder.png"
            alt="Profile Background"
            className="object-cover object-top w-full h-full rounded-b-[100px] opacity-50"
          />
        </div>

        <MemberCard />
      </div>
      <div className="flex w-full max-w-md mx-auto justify-center mt-24 mb-20">
        <AthleteProfileSettings />
      </div>
    </div>
  );
}
