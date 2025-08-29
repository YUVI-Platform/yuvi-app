"use client";

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
    </div>
  );
};
