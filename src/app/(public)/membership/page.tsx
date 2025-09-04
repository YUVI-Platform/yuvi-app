"use client";
import { Check } from "feather-icons-react";
import { MultiStateButton } from "@/components/UI/MultiStateButton";
import { useState } from "react";
import Link from "next/link";

export default function MembershipPage() {
  const [isYearly, setIsYearly] = useState(false);

  const handleToggle = async (value: boolean) => {
    await setIsYearly(value);
  };

  return (
    <main className="flex-col gap-8 w-full h-full md:min-h-screen md:max-w-screen flex justify-center items-center pt-20 pb-40">
      <MultiStateButton
        labels={["Monatlich", "Jährlich"]}
        onChange={(value) => handleToggle(value)}
      />
      <div className="grid grid-cols-1 gap-10 md:gap-6 md:grid-cols-3 p-4">
        <div className="flex flex-col justify-center items-center gap-8 rounded-2xl shadow-xl bg-white p-4 md:w-96  ">
          <h2 className="text-3xl font-bold">Lite</h2>
          <div className="flex gap-6 text-indigo-400">
            <h3 className="text-6xl font-bold ">
              {isYearly ? "49.99€" : "4.99€"}
            </h3>
            <span>pro Monat</span>
          </div>
          <Link
            href={"/login/signup"}
            className="bg-indigo-400 text-white font-bold py-2 px-4 rounded-2xl w-full hover:bg-indigo-500 transition-colors duration-300 text-center"
          >
            Starte Jetzt!
          </Link>
          <div className="flex items-center gap-2 w-full text-gray-400">
            <Check className="text-gray-400" />4 Kurse pro Woche
          </div>
        </div>
        {/* pro */}
        <div className="relative border-2 md:w-96 border-indigo-400 rounded-2xl">
          <div className="absolute w-fit h-fit text-indigo-500 bg-indigo-100 px-4 py-2 text-sm border-2 border-indigo-400 rounded-full inset-0 -top-6 left-4">
            <span>Beliebt</span>
          </div>
          <div className="flex flex-col justify-center items-center gap-8 rounded-2xl shadow-xl bg-white p-4">
            <h2 className="text-3xl font-bold">Pro</h2>
            <div className="flex gap-6 text-indigo-400">
              <h3 className="text-6xl font-bold ">
                {isYearly ? "99.99€" : "9.99€"}
              </h3>
              <span>pro Monat</span>
            </div>
            <Link
              href={"/login/signup"}
              className="bg-indigo-400 text-white font-bold py-2 px-4 rounded-2xl w-full hover:bg-indigo-500 transition-colors duration-300 text-center"
            >
              Starte Jetzt!
            </Link>
            <div className="flex items-center gap-2 w-full text-gray-400">
              <Check className="text-gray-400" />7 Kurse pro Woche
            </div>
          </div>
        </div>
        {/* premium */}
        <div className="flex flex-col justify-center items-center gap-8 rounded-2xl shadow-xl bg-white p-4 md:w-96">
          <h2 className="text-3xl font-bold">Premium</h2>
          <div className="flex gap-6 text-indigo-400">
            <h3 className="text-6xl font-bold ">
              {isYearly ? "199.99€" : "19.99€"}
            </h3>
            <span>pro Monat</span>
          </div>
          <Link
            href={"/login/signup"}
            className="bg-indigo-400 text-white font-bold py-2 px-4 rounded-2xl w-full hover:bg-indigo-500 transition-colors duration-300 text-center"
          >
            Starte Jetzt!
          </Link>
          <div className="flex items-center gap-2 w-full text-gray-400">
            <Check className="text-gray-400" />
            unlimited
          </div>
        </div>
      </div>
    </main>
  );
}
