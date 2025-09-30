"use client";

import MultiStepFormDataTypes from "@/Types/MultiStepWizzardTypes";
// import { Field, Label, Switch } from "@headlessui/react";
// import React, { useState, useEffect } from "react";

// interface DateAndTimeInputProps {
//   date?: string;
//   time?: string;
// }

export const SessionSlotsStep = ({
  formData,
  setFormData,
}: {
  formData: MultiStepFormDataTypes;
  setFormData: (data: MultiStepFormDataTypes) => void;
}) => {
  console.log("Form Data in SessionSlotsStep:", formData);
  // Handle form data changes specific to this step
  const handleDateAndTimeChange = () => {
    setFormData({});
  };

  return (
    <div className="grid grid-cols-1 justify-items-center gap-8 text-indigo-400">
      <h2 className="text-2xl font-bold text-gray-800">
        Bitte gib deine Kursverfügbarkeit an
      </h2>
      {/* Availability Input */}
      <p>Gib mindestens einen Tag und Uhrzeit an.</p>

      <div
        onClick={handleDateAndTimeChange}
        className="grid grid-cols-1 justify-items-center gap-4 max-h-[300px] overflow-y-scroll border-indigo-100 border-2 overflow-box-scroll-hidden w-fit rounded-2xl p-8"
      ></div>
    </div>
  );
};

// type DateAndTimeInputFieldProps = {
//   date: string;
//   startTime: string;
//   endTime: string;
//   onChange: (value: {
//     date: string;
//     startTime: string;
//     endTime: string;
//   }) => void;
// };

// const DateAndTimeInput: React.FC<DateAndTimeInputFieldProps> = ({
//   date,
//   startTime,
//   endTime,
//   onChange,
// }) => {
//   return (
//     <div className="flex gap-4 justify-center items-center">
//       <input
//         type="date"
//         value={date}
//         onChange={(e) => onChange({ date: e.target.value, startTime, endTime })}
//         className="border-2 p-2 rounded-xl border-indigo-100"
//       />
//       <span>:</span>
//       <input
//         type="time"
//         value={startTime}
//         onChange={(e) => onChange({ date, startTime: e.target.value, endTime })}
//         className="border-2 p-2 rounded-xl border-indigo-100"
//       />
//       <span>–</span>
//       <input
//         type="time"
//         value={endTime}
//         onChange={(e) => onChange({ date, startTime, endTime: e.target.value })}
//         className="border-2 p-2 rounded-xl border-indigo-100"
//       />
//     </div>
//   );
// };
