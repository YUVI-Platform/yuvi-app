"use client";

import { MultiStateButton } from "../MultiStateButton";
import React, { useState } from "react";
import { CitySelector } from "../Selctors";
import { AnimatePresence, motion } from "framer-motion";

export default function AboveTheFoldSection() {
  const [searchType, setSearchType] = useState("session"); // true for Session, false for Studio"]
  // const [enabled, setEnabled] = useState(false);
  // const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  const HandleSearchTypeChange = (value: boolean) => {
    setSearchType(value ? "session" : "studio");
  };

  return (
    <main className="flex items-center justify-center h-screen max-h-[1000px] w-full gap-4 bg-[url(/landingpage-placeholder.avif)] bg-no-repeat bg-cover bg-center">
      <div className="flex flex-col justify-center items-center text-white bg-black/40 w-full h-full gap-8 mt-10 p-4 md:p-24">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-2 md:gap-4 bg-white/90 w-fit border border-white backdrop-blur-sm p-4 md:p-6 pb-12 rounded-4xl justify-center items-center text-black"
        >
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl text-indigo-400 text-center">
              Your Space To Move!
            </h1>
            <p className="text-md p-4 text-gray-600 text-center sm:text-left">
              Finde Jetzt dein Passendes Studio oder Motion Session in deiner
              Nähe!
            </p>
          </div>
          <div className="w-fit flex justify-center items-center drop-shadow-sm">
            <MultiStateButton
              labels={["Session", "Studio"]}
              onChange={HandleSearchTypeChange}
            />
          </div>
          <CitySelector />
          <AnimatePresence initial={false}>
            {searchType === "session" && (
              <motion.div
                key="session-selector"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
                className="w-full"
              >
                <SessionSelector />
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex w-full min-h-14 justify-between border-2 border-indigo-200 rounded-2xl text-indigo-400">
            <input
              type="date"
              className="w-full h-full outline-none placeholder:text-indigo-400  p-4 text-indigo-400"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button className="bg-indigo-400 text-white text-xl font-bold py-3 px-6 rounded-2xl hover:bg-yuvi-rose transition-colors duration-150 cursor-pointer mt-4">
            Jetzt Session Finden!
          </button>
        </form>
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
  );
}

const SessionSelector = () => {
  return (
    <select className="w-full h-full min-h-14 outline-none placeholder:text-indigo-400  p-4 text-indigo-400 border-2 border-indigo-200 rounded-2xl">
      {SessionTypeData.map((session) => (
        <option
          key={session.value}
          value={session.value}
          className="outline-none placeholder:text-indigo-400  p-4 text-indigo-400 "
        >
          {session.label}
        </option>
      ))}
    </select>
  );
};

const SessionTypeData = [
  { label: "Yoga", value: "yoga" },
  { label: "Pilates", value: "pilates" },
  { label: "HIIT", value: "hiit" },
  { label: "Dance", value: "dance" },
  { label: "Strength Training", value: "strength" },
  { label: "Cardio", value: "cardio" },
  { label: "Cycling", value: "cycling" },
  { label: "Meditation", value: "meditation" },
  { label: "Flexibility", value: "flexibility" },
  { label: "CrossFit", value: "crossfit" },
  { label: "Zumba", value: "zumba" },
  { label: "Boxing", value: "boxing" },
];
