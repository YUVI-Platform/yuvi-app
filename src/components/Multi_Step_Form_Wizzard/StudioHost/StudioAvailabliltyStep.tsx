"use client";

import MultiStepFormDataTypes from "@/Types/MultiStepWizzardTypes";
import { X } from "feather-icons-react";
import dayjs from "dayjs";

const StudioAvailabilityStep = ({
  formData,
  setFormData,
}: {
  formData: MultiStepFormDataTypes;
  setFormData: (data: MultiStepFormDataTypes) => void;
}) => {
  const schedule = formData.studioAvailability?.weeklySchedule || [];

  const handleAddDay = () => {
    const newSchedule = [
      ...schedule,
      { day: "monday", from: "08:00", to: "18:00" },
    ];
    setFormData({
      ...formData,
      studioAvailability: {
        ...formData.studioAvailability,
        weeklySchedule: newSchedule,
      },
    });
  };

  const handleChange = (
    index: number,
    field: "day" | "from" | "to",
    value: string
  ) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setFormData({
      ...formData,
      studioAvailability: {
        ...formData.studioAvailability,
        weeklySchedule: updated,
      },
    });
  };

  const handleRemove = (index: number) => {
    const filtered = schedule.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      studioAvailability: {
        ...formData.studioAvailability,
        weeklySchedule: filtered,
      },
    });
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setFormData({
      ...formData,
      studioAvailability: {
        ...formData.studioAvailability,
        [field]: dayjs(value).toISOString(),
      },
    });
  };

  return (
    <div className="flex flex-col items-center h-full w-full rounded-2xl overflow-hidden overflow-y-scroll gap-8 p-8">
      <h1 className="text-2xl font-semibold text-center">
        Wann möchtest du dein Studio verfügbar machen?
      </h1>

      {/* Zeitraum */}
      <div className="flex gap-8">
        <div className="flex flex-col">
          <label htmlFor="startDate">Von</label>
          <input
            type="date"
            id="startDate"
            value={
              formData.studioAvailability?.startDate
                ? dayjs(formData.studioAvailability.startDate).format(
                    "YYYY-MM-DD"
                  )
                : ""
            }
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate">Bis</label>
          <input
            type="date"
            id="endDate"
            value={
              formData.studioAvailability?.endDate
                ? dayjs(formData.studioAvailability.endDate).format(
                    "YYYY-MM-DD"
                  )
                : ""
            }
            onChange={(e) => handleDateChange("endDate", e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Wöchentlicher Zeitplan */}
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-2">Wöchentlicher Zeitplan</h2>
        <p className="text-gray-600 mb-4">
          Lege fest, an welchen Tagen und zu welchen Zeiten dein Studio
          verfügbar ist.
        </p>

        <div className="flex flex-col gap-4 overflow-hidden overflow-y-scroll max-h-80">
          {schedule.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 items-center border p-2 rounded"
            >
              <select
                value={item.day}
                onChange={(e) => handleChange(index, "day", e.target.value)}
                className="p-2 border rounded"
              >
                <option value="monday">Montag</option>
                <option value="tuesday">Dienstag</option>
                <option value="wednesday">Mittwoch</option>
                <option value="thursday">Donnerstag</option>
                <option value="friday">Freitag</option>
                <option value="saturday">Samstag</option>
                <option value="sunday">Sonntag</option>
              </select>

              <input
                type="time"
                value={item.from}
                onChange={(e) => handleChange(index, "from", e.target.value)}
                className="p-2 border rounded"
              />
              <span>bis</span>
              <input
                type="time"
                value={item.to}
                onChange={(e) => handleChange(index, "to", e.target.value)}
                className="p-2 border rounded"
              />
              <button
                onClick={() => handleRemove(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X />
              </button>
            </div>
          ))}
        </div>

        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded mt-6"
          onClick={handleAddDay}
        >
          + Tag hinzufügen
        </button>
      </div>
    </div>
  );
};

export default StudioAvailabilityStep;
