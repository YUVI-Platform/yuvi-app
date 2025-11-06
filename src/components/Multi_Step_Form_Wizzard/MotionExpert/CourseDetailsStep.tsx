"use client";

import MultiStepFormDataTypes from "@/types/MultiStepWizzardTypes";
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

const fitnessLevels = ["beginner", "progressive", "expert"];

export interface CourseDetailsProps {
  title: string;
  description: string;
  selectedSports: string[];
}

export const CourseDetailsStep = ({
  formData,
  setFormData,
}: {
  formData: MultiStepFormDataTypes;
  setFormData: React.Dispatch<React.SetStateAction<MultiStepFormDataTypes>>;
}) => {
  const [courseDetails, setCourseDetails] = useState<CourseDetailsProps>({
    title: "",
    description: "",
    selectedSports: [],
  });

  const [sessionRecommendationsItems, setSessionRecommendationsItems] =
    useState<string[]>([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-indigo-400 w-full">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
        <label htmlFor="course-title" className="font-semibold text-xl">
          Gibt deiner Class einen Titel
        </label>
        <input
          id="title"
          className="bg-indigo-50 rounded-xl p-2 text-center focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          type="text"
          placeholder="Titel des Kurses"
          value={courseDetails.title}
          onChange={(e) =>
            setCourseDetails((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        <label htmlFor="course-description" className="font-semibold text-xl">
          Sag deinen Athleten was sie erwartet
        </label>
        <textarea
          id="course-description"
          className="bg-indigo-50 rounded-lg p-2 text-center resize-none"
          placeholder="Beschreibung des Kurses"
          rows={4}
          value={courseDetails.description}
          onChange={(e) =>
            setCourseDetails((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />

        <input
          type="number"
          className="bg-indigo-50 rounded-lg p-2 text-center"
          placeholder="Session Dauer in Minuten"
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              sessionDuration: parseInt(e.target.value),
            }))
          }
        />
        <span className="font-light text-sm text-red-400">
          <InfoIcon size={16} className="inline mb-1" /> Beachte: 15 min Vor- &
          Nachbereitungszeit
        </span>

        <input
          type="text"
          className="bg-indigo-50 rounded-lg p-2 text-center"
          placeholder="Preis pro Athlete"
        />

        <select
          className="mt-4 p-2 border border-gray-300 rounded-md"
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              sessionLevel: e.target.value as
                | "beginner"
                | "progressive"
                | "expert",
            }))
          }
        >
          <option value="" disabled selected>
            Empfohlenes Fitnesslevel
          </option>
          {fitnessLevels.map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
        <div>
          <label className="font-semibold text-xl block mb-2">
            Was sollten deine Athleten mitbringen?
          </label>
          <div className="flex flex-wrap gap-2">
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
                className={`px-3 py-1 rounded-full border text-sm ${
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
            className="p-2 mt-2 border rounded w-full"
          />
        </div>

        <div>
          <label className="font-semibold text-xl block text-center mb-2">
            Tage deine Class damit deine Athleten dich finden
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto bg-indigo-50 p-4 rounded-2xl">
            {sportActivities.map((activity, index) => (
              <label
                htmlFor={activity}
                key={index}
                className="flex items-center gap-2 cursor-pointer"
              >
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
                {activity}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
