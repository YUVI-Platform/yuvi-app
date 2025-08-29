"use client";

import React, { useState } from "react";
import { Users, User, Globe } from "feather-icons-react";

export interface CourseTypeProps {
  type: "Personal Class" | "Group Class" | "Online Class";
}

const CourseTypesMotionExpert = [
  "Personal Class",
  "Group Class",
  "Online Class",
];

export const CourseTypeStep = () => {
  const [selectedCourseType, setSelectedCourseType] = useState<string | null>(
    null
  );
  console.log(typeof (<User />));
  return (
    <div className="grid grid-cols-1 justify-items-center gap-8 w-full text-indigo-400">
      <h2 className="text-2xl font-bold">
        Welchen Motion Class Type möchtest du Launchen?
      </h2>

      <div className="grid grid-cols-3 gap-y-8 justify-items-center w-full">
        {CourseTypesMotionExpert.map((courseType) => (
          <CourseTypeButton
            key={courseType + "motion-expert"}
            selectedCourseType={selectedCourseType}
            setSelectedCourseType={setSelectedCourseType}
            labelText={courseType}
            icon={
              courseType === "Personal Class" ? (
                <User size={"80"} strokeWidth={1.2} />
              ) : courseType === "Group Class" ? (
                <Users size={"80"} strokeWidth={1.2} />
              ) : (
                <Globe size={"80"} strokeWidth={1.2} />
              )
            }
          />
        ))}
      </div>
      <span>{selectedCourseType}</span>
    </div>
  );
};

interface CourseTypeButtonProps {
  selectedCourseType: string | null;
  setSelectedCourseType: (type: string | null) => void;
  labelText: string;
  icon?: React.ReactNode;
}

// To Do: Rename to RadioButton for RadioButton Group and ad checkmark icon
const CourseTypeButton: React.FC<CourseTypeButtonProps> = ({
  selectedCourseType,
  setSelectedCourseType,
  labelText,
  icon,
}) => {
  return (
    <div className="relative">
      <input
        type="checkbox"
        id={labelText.toLowerCase().replace(/\s+/g, "-")}
        value={labelText.toLowerCase().replace(/\s+/g, "-")}
        checked={
          selectedCourseType === labelText.toLowerCase().replace(/\s+/g, "-")
        }
        onChange={() =>
          setSelectedCourseType(
            selectedCourseType === labelText.toLowerCase().replace(/\s+/g, "-")
              ? null
              : labelText.toLowerCase().replace(/\s+/g, "-")
          )
        }
        className="hidden peer"
      />
      <label
        htmlFor={labelText.toLowerCase().replace(/\s+/g, "-")}
        className="rounded-4xl cursor-pointer peer-checked:shadow-lg peer-checked:bg-indigo-400 font-bold peer-checked:text-white border-indigo-400 border-3 w-52 h-52 hover:bg-indigo-100 hover:text-white flex flex-col items-center justify-center transition-colors"
      >
        <div>{icon}</div>
        <span>{labelText}</span>
      </label>
    </div>
  );
};
