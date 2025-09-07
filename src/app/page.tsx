"use client";
import Link from "next/link";

import { CourseLocationCard } from "../components/UI/Cards/LocationCards";

import { locations } from "@/testdata/locationData";

import { FAQBlock } from "@/components/FAQ/FaqBlock";
import { Crosshair, Search } from "feather-icons-react";
import { MultiStateButton } from "@/components/UI/MultiStateButton";
import { Session } from "inspector/promises";
import TestimonialCard from "@/components/UI/Cards/TestimonialCard";
import { TestimonialSection } from "@/components/UI/Sections/TestiomonialSection";
import MotionExpertsSection from "@/components/UI/Sections/MotionExpertsSection";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <main className="flex items-center justify-center h-screen max-h-[1000px] w-full gap-4 bg-[url(/landingpage-placeholder.avif)] bg-no-repeat bg-cover bg-center">
        <div className="flex flex-col justify-center items-center text-white bg-black/40 w-full h-full gap-8">
          <div className="flex flex-col gap-4 bg-white/90 w-fit border border-white backdrop-blur-sm p-6 pb-12 rounded-4xl justify-center items-center text-black">
            <div className="flex flex-col">
              <h1 className="text-5xl font-bold text-indigo-400 text-center">
                Ready to get Movin?
              </h1>
              <p className="text-md p-4 text-gray-600 text-center sm:text-left">
                Finde Jetzt dein Passendes Studio oder Motion Session in deiner
                Nähe!
              </p>
            </div>
            <div className="w-fit flex justify-center items-center drop-shadow-sm">
              <MultiStateButton labels={["Session", "Studio"]} />
            </div>
            <div className="flex w-full justify-between border-2 border-indigo-200 rounded-2xl p-4 text-indigo-400">
              <input
                type="text"
                placeholder="Dein Standort"
                className="w-full h-full outline-none placeholder:text-indigo-400"
              />
              <Search />
            </div>
            <div className="flex w-full justify-between border-2 border-indigo-200 rounded-2xl text-indigo-400">
              <input
                type="date"
                placeholder="Dein Standort"
                className="w-full h-full outline-none placeholder:text-indigo-400  p-4 text-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-400 text-white text-xl font-bold py-2 px-4 rounded-2xl hover:bg-yuvi-rose transition-colors duration-300 cursor-pointer mt-4"
            >
              Jetzt Session Finden!
            </button>
          </div>
          {/* <div className="flex flex-col items-center justify-center gap-4"> */}
          {/* <h1 className="text-6xl font-bold text-center sm:text-left gelasio">
              Hi Athletes, we are Yuvi!
            </h1>
            <p className="text-2xl text-center sm:text-left">
              WE TURN (EMPTY) SPACES INTO URBAN MOVEMENT
            </p>
          </div>
          <Link
            href="/membership"
            className="text-lg text-white bg-indigo-400 font-bold py-2 px-4 rounded-2xl hover:bg-yuvi-rose transition-colors duration-300"
          >
            Start your journey!
          </Link> */}
        </div>
      </main>
      <MotionExpertsSection />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 my-24">
        {locations.map((loc) => (
          <CourseLocationCard
            key={loc.id}
            name={loc.name}
            address={loc.address}
            size={loc.size}
            availableFrom={loc.availableFrom}
            availableTo={loc.availableTo}
            features={loc.features}
            rating={loc.rating}
            imageUrl={loc.imageUrl}
          />
        ))}
      </section>

      <div className="flex flex-col items-center justify-center w-full max-w-[1000px] p-4 md:p-24 pb-32">
        <h2 className="text-4xl font-bold text-center text-indigo-400">
          Sportwissen – von der Community, für die Community.
        </h2>
        <p>
          Über unsere digitale Infrastruktur vernetzen wir
          ImmobilieneigentümerInnen, TrainerInnen und AthletInnen miteinander
          indem wir ungenutzte urbane Flächen in flexible Boutique-Sportstudios
          verwandeln. Dadurch wollen wir jeder Person, ob mit oder ohne Studio,
          indoor oder outdoor, die Möglichkeit bieten, ihr sportliches Wissen
          frei zu entfalten, Menschen zu inspirieren und sich in einer
          dynamischen Community zu verwirklichen.
        </p>
      </div>

      <TestimonialSection />

      <div className="flex flex-col items-center justify-center w-full max-w-[1000px] p-4 md:p-24 pb-32 gap-8">
        <h2 className="text-4xl font-bold text-center text-indigo-400">
          Join the Movement
        </h2>
        <p className="text-center">
          Werde Teil unserer Community und gestalte die Zukunft des Sports mit
          uns. Egal, ob als Motion Expert:in, Athlet:in oder Studiohost –
          gemeinsam schaffen wir neue Räume für Bewegung und Inspiration.
        </p>

        <Link
          href="/membership"
          className="text-lg text-white bg-indigo-400 font-bold py-2 px-4 rounded-2xl hover:bg-yuvi-rose transition-colors duration-300"
        >
          Jetzt Teil der YUVI Familie werden!
        </Link>
      </div>

      <FAQBlock />
    </div>
  );
}
