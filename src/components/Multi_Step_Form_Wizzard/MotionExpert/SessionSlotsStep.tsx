// components/SessionSlotsStep.tsx
"use client";

import { useState } from "react";
import dayjs from "dayjs";
import MultiStepFormDataTypes from "@/types/MultiStepWizzardTypes";

export const SessionSlotsStep = ({
  formData,
  setFormData,
}: {
  formData: MultiStepFormDataTypes;
  setFormData: (data: MultiStepFormDataTypes) => void;
}) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const handleSlotToggle = (slotId: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  return (
    <div className="grid grid-cols-1 justify-items-center gap-8 text-indigo-400">
      <h2 className="text-2xl font-bold text-gray-800">
        Bitte wähle deine Kursverfügbarkeit
      </h2>
      <p>Wähle mindestens einen Timeslot aus.</p>

      <div className="flex w-full gap-4 max-h-[500px] overflow-x-auto rounded-2xl">
        {mockSessionSlots.map((day) => (
          <TimeSlotColumn
            key={day.date}
            day={day}
            selectedSlots={selectedSlots}
            onSlotToggle={handleSlotToggle}
          />
        ))}
      </div>
    </div>
  );
};

export const mockSessionSlots = [
  {
    date: "2025-10-01",
    slots: [
      { id: "slot-1", time: "10:00–11:00", available: true },
      { id: "slot-2", time: "11:00–12:00", available: true },
      { id: "slot-3", time: "12:00–13:00", available: false },
      { id: "slot-4", time: "13:00–14:00", available: true },
    ],
  },
  {
    date: "2025-10-02",
    slots: [
      { id: "slot-5", time: "10:00–11:00", available: true },
      { id: "slot-6", time: "11:00–12:00", available: false },
      { id: "slot-7", time: "12:00–13:00", available: true },
    ],
  },
  {
    date: "2025-10-03",
    slots: [
      { id: "slot-8", time: "09:00–10:00", available: true },
      { id: "slot-9", time: "10:00–11:00", available: true },
      { id: "slot-10", time: "11:00–12:00", available: false },
    ],
  },
  {
    date: "2025-10-04",
    slots: [
      { id: "slot-11", time: "14:00–15:00", available: true },
      { id: "slot-12", time: "15:00–16:00", available: true },
      { id: "slot-13", time: "16:00–17:00", available: true },
      { id: "slot-17", time: "17:00–18:00", available: false },
      { id: "slot-18", time: "18:00–19:00", available: true },
    ],
  },
  {
    date: "2025-10-05",
    slots: [
      { id: "slot-14", time: "10:00–11:00", available: false },
      { id: "slot-15", time: "11:00–12:00", available: true },
      { id: "slot-16", time: "12:00–13:00", available: true },
    ],
  },
];

// components/TimeSlotColumn.tsx

interface Slot {
  id: string;
  time: string;
  available: boolean;
}

interface TimeSlotColumnProps {
  day: {
    date: string;
    slots: Slot[];
  };
  selectedSlots: string[];
  onSlotToggle: (slotId: string) => void;
}

export const TimeSlotColumn = ({
  day,
  selectedSlots,
  onSlotToggle,
}: TimeSlotColumnProps) => {
  return (
    <div className="flex flex-col w-56 min-w-[220px] border-r border-indigo-100">
      <div className="text-center text-lg font-semibold border-b border-indigo-100 px-2 bg-indigo-50">
        {dayjs(day.date).format("DD. MMM")}
      </div>
      {day.slots.map((slot) => {
        const isSelected = selectedSlots.includes(slot.id);
        return (
          <div
            key={slot.id}
            className={`mt-3 p-3 rounded-xl flex items-center justify-between gap-2 ${
              !slot.available
                ? "bg-slate-200 text-slate-400 line-through"
                : isSelected
                ? "bg-indigo-400 text-white"
                : "bg-slate-100 hover:bg-indigo-100 cursor-pointer"
            }`}
            onClick={() => slot.available && onSlotToggle(slot.id)}
          >
            <input
              type="checkbox"
              className="accent-indigo-500"
              checked={isSelected}
              readOnly
            />
            <span className="text-sm font-medium">{slot.time}</span>
            <span
              className={`h-2 w-2 rounded-full ${
                !slot.available ? "bg-red-400" : "bg-emerald-400"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};
//TODO: Active in Active Style

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
