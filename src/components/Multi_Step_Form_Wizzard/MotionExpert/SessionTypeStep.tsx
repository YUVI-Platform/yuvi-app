"use client";

import React, { useState } from "react";
import { User } from "feather-icons-react";
import { DumbbellIcon, UserRoundIcon, UsersRoundIcon } from "lucide-react";
import MultiStepFormDataTypes from "@/types/MultiStepWizzardTypes";

export interface CourseTypeProps {
  type: "Private Session" | "Group Session" | "Train With Me";
}

const CourseTypesMotionExpert = [
  "Private Session",
  "Group Session",
  "Train With Me",
];

export const SessionTypeStep = ({
  formData,
  setFormData,
}: {
  formData: MultiStepFormDataTypes;
  setFormData: React.Dispatch<React.SetStateAction<MultiStepFormDataTypes>>;
}) => {
  const [selectedCourseType, setSelectedCourseType] = useState<string | null>(
    null
  );

  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      courseType: selectedCourseType as
        | "Private Session"
        | "Group Session"
        | "Train With Me"
        | null,
    }));
    console.log("Updated selectedCourseType:", selectedCourseType);
  }, [selectedCourseType, setFormData]);

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
              courseType === "Private Session" ? (
                <UserRoundIcon size={"80"} strokeWidth={1.2} />
              ) : courseType === "Group Session" ? (
                <UsersRoundIcon size={"80"} strokeWidth={1.2} />
              ) : (
                <DumbbellIcon size={"80"} strokeWidth={1.2} />
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
