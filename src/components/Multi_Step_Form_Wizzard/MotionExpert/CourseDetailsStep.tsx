"use client";

import { Info } from "feather-icons-react";
import { InfoIcon } from "lucide-react";
import React, { useState } from "react";

const sportActivities = [
  "Basketball",
  "Calisthenics",
  "CrossFit",
  "Functional Training",
  "Fußball",
  "Handball",
  "Hyrox",
  "Krafttraining",
  "Laufen",
  "Mobility",
  "Padeltennis",
  "Pilates",
  "Radfahren",
  "Schwimmen",
  "Tennis",
  "Tischtennis",
  "Turnen",
  "Yoga",
];

const sessionRecommendations = [
  "Trinkflasche",
  "Handtuch",
  "Yogamatte",
  "Sportschuhe",
];

const fitnessLevels = ["Anfänger", "Fortgeschritten", "Experte"];

export interface CourseDetailsProps {
  title: string;
  description: string;
  selectedSports: string[];
}

export const CourseDetailsStep = () => {
  const [courseDetails, setCourseDetails] = useState<CourseDetailsProps>({
    title: "",
    description: "",
    selectedSports: [],
  });

  const [sessionRecommendationsItems, setSessionRecommendationsItems] =
    useState<string[]>([]);

  return (
    <div className="grid grid-cols-1 justify-items-center gap-8 text-indigo-400 w-full">
      {/* Course Types */}
      <div className="relative grid grid-cols-1 gap-y-4 justify-items-center w-full">
        <label htmlFor="course-title" className="font-semibold text-xl">
          Gibt deiner Class einen Titel
        </label>
        <input
          id="title"
          className="bg-indigo-50 rounded-xl p-2 w-full max-w-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 text-center"
          type="text"
          placeholder="Titel des Kurses"
          value={courseDetails.title}
          onChange={(e) =>
            setCourseDetails({ ...courseDetails, title: e.target.value })
          }
        />
        <label htmlFor="course-title" className="font-semibold text-xl">
          Sag deinen Athleten was sie erwartet
        </label>
        <textarea
          className="bg-indigo-50 rounded-lg p-2 w-full max-w-lg resize-non text-center resize-none"
          placeholder="Beschreibung des Kurses"
          value={courseDetails.description}
          onChange={(e) =>
            setCourseDetails({ ...courseDetails, description: e.target.value })
          }
          rows={4}
        />
        <input
          type="number"
          className="bg-indigo-50 rounded-lg p-2 w-full max-w-lg text-center"
          placeholder="Trainingszeit"
        />
        <span className="font-light text-sm text-red-400">
          <InfoIcon size={16} className="inline mb-1" /> Bitte beachte das du
          eine vor und Nachbereitungszeit von 15 Minuten hast
        </span>
      </div>
      <select
        //TODO: Recommended Fitness Level

        className="mt-4 p-2 border border-gray-300 rounded-md w-64"
      >
        <option value="" disabled>
          Empfohlenes Fitnesslevel
        </option>
        <option value="Anfänger">Anfänger</option>
        <option value="Fortgeschritten">Fortgeschritten</option>
        <option value="Experte">Experte</option>
      </select>
      <label className="font-semibold text-xl">
        Was sollten deine Athleten mitbringen?
      </label>
      <div className="grid grid-cols-3">
        {sessionRecommendations.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setSessionRecommendationsItems((prev) =>
                prev.includes(item)
                  ? prev.filter((i) => i !== item)
                  : [...prev, item]
              )
            }
            className={`m-1 px-3 py-1 rounded-full border ${
              sessionRecommendationsItems.includes(item)
                ? "bg-indigo-400 text-white border-indigo-400"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Sonstiges"
        className="p-2 border rounded"
      />

      <div className="grid grid-cols-1 gap-y-2 w-full max-w-lg ">
        <label className="font-semibold text-xl text-center">
          Tage deine Class damit deine Athleten dich finden
        </label>
        <div className=" grid grid-cols-2 gap-4 justify-items-start overflow-y-scroll h-44 px-8 p-8 rounded-2xl bg-indigo-50 overflow-box-scroll-hidden w-full max-w-lg">
          {sportActivities.map((activity, index) => (
            <label
              htmlFor={activity}
              key={index}
              className="flex items-center gap-2 cursor-pointer flex-row-reverse"
            >
              {activity}
              <input
                type="checkbox"
                id={activity}
                value={activity}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setCourseDetails((prev) => {
                    const selectedSports = isChecked
                      ? [...prev.selectedSports, activity]
                      : prev.selectedSports.filter(
                          (sport) => sport !== activity
                        );
                    return { ...prev, selectedSports };
                  });
                }}
                className="cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
