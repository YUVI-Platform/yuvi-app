"use client";

import { Field, Label, Switch } from "@headlessui/react";
import React, { useState, useEffect } from "react";

interface DateAndTimeInputProps {
  date?: string;
  time?: string;
}

export const CourseAvailabilityStep = () => {
  const [dateAndTimeInputs, setDateAndTimeInputs] = useState<
    DateAndTimeInputProps[]
  >([{ date: "", time: "" }]);
  const [everyDay, setEveryDay] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [monday, setMonday] = useState(false);
  const [tuesday, setTuesday] = useState(false);
  const [wednesday, setWednesday] = useState(false);
  const [thursday, setThursday] = useState(false);
  const [friday, setFriday] = useState(false);
  const [saturday, setSaturday] = useState(false);
  const [sunday, setSunday] = useState(false);

  useEffect(() => {
    setIsDisabled(everyDay);
  }, [everyDay]);

  const handleAddDateAndTimeInput = () => {
    setDateAndTimeInputs([...dateAndTimeInputs, { date: "", time: "" }]);
    console.log(isDisabled);
  };

  return (
    <div className="grid grid-cols-1 justify-items-center gap-8 text-indigo-400">
      <h2 className="text-2xl font-bold text-gray-800">
        Bitte gib deine Kursverfügbarkeit an
      </h2>
      {/* Availability Input */}
      <p>Gib mindestens einen Tag und Uhrzeit an.</p>

      <div className="grid grid-cols-1 justify-items-center gap-4 max-h-[300px] overflow-y-scroll border-indigo-100 border-2 overflow-box-scroll-hidden w-fit rounded-2xl p-8">
        {/* Date and Time Dynamic Input Map*/}
        {dateAndTimeInputs.map((input, index) => (
          <div key={index} className="flex gap-4 justify-center items-center">
            <DateAndTimeInput
              date={input.date ?? ""}
              startTime={input.time?.split("-")[0] ?? ""}
              endTime={input.time?.split("-")[1] ?? ""}
              onChange={(value) => {
                const newInputs = [...dateAndTimeInputs];
                newInputs[index] = {
                  date: value.date,
                  time: `${value.startTime}-${value.endTime}`,
                };
                setDateAndTimeInputs(newInputs);
              }}
            />
            {dateAndTimeInputs.length > 1 && (
              <button
                className="px-4 py-2 bg-indigo-400 text-white rounded-lg hover:bg-fuchsia-300 transition-colors cursor-pointer"
                onClick={() => {
                  const newInputs = dateAndTimeInputs.filter(
                    (_, i) => i !== index
                  );
                  setDateAndTimeInputs(newInputs);
                }}
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
      <div>
        <button
          className="px-4 py-2 bg-indigo-400 text-white rounded-lg hover:bg-fuchsia-300 transition-colors cursor-pointer"
          onClick={handleAddDateAndTimeInput}
        >
          Mehr Hinzufügen
        </button>
      </div>
      <span>{JSON.stringify(dateAndTimeInputs)}</span>
      <Field className="flex gap-2">
        <Switch
          onChange={() => setRepeat(!repeat)}
          value="every-day"
          className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition ease-in-out duration-800 data-checked:bg-fuchsia-300 data-disabled:bg-gray-100 "
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition ease-in-out duration-800 group-data-checked:translate-x-6 data-disabled:bg-gray-100" />
        </Switch>
        <Label className="data-disabled:text-gray-300">
          Wiederkehrende Trainings Tage
        </Label>
      </Field>
      <div
        className={`flex flex-col justify-start items-start gap-4 w-fit min-w-96 p-8 absolute shadow-lg rounded-2xl bg-white ${
          !repeat ? "hidden" : ""
        } `}
      >
        {/* Multi select for trainings days and if it repeats */}

        <Field className="flex gap-2">
          <Switch
            onChange={() => setEveryDay(!everyDay)}
            value="every-day"
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition ease-in-out duration-800 data-checked:bg-fuchsia-300 data-disabled:bg-gray-100 "
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition ease-in-out duration-800 group-data-checked:translate-x-6 data-disabled:bg-gray-100" />
          </Switch>
          <Label className="data-disabled:text-gray-300">Every Day</Label>
        </Field>
        <div className="flex gap-2 items-center justify-between w-full">
          <Field disabled={everyDay} className="flex gap-2">
            <Switch
              checked={monday}
              onChange={() => setMonday(!monday)}
              className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-fuchsia-300 data-disabled:bg-gray-100"
            >
              <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6 data-disabled:text-gray-200" />
            </Switch>
            <Label>Montag</Label>
          </Field>
          <button className="px-3 aspect-square rounded-full hover:bg-blue-800 text-white bg-blue-500">
            +
          </button>
        </div>

        <div className="flex gap-2 items-center justify-between w-full">
          <Field disabled={everyDay} className="flex gap-2">
            <Switch
              checked={tuesday}
              onChange={() => setTuesday(!tuesday)}
              className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-fuchsia-300 data-disabled:bg-gray-100"
            >
              <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6 data-disabled:text-gray-200" />
            </Switch>
            <Label>Dienstag</Label>
          </Field>{" "}
          <button className="px-3 aspect-square rounded-full hover:bg-blue-800 text-white bg-blue-500">
            +
          </button>
        </div>
        <Field disabled={everyDay} className="flex gap-2">
          <Switch
            checked={wednesday}
            onChange={() => setWednesday(!wednesday)}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-fuchsia-300 data-disabled:bg-gray-100"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6 data-disabled:text-gray-200" />
          </Switch>
          <Label>Mittwoch</Label>
        </Field>
        <Field disabled={everyDay} className="flex gap-2">
          <Switch
            checked={thursday}
            onChange={() => setThursday(!thursday)}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-fuchsia-300 data-disabled:bg-gray-100"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6 data-disabled:text-gray-200" />
          </Switch>
          <Label>Donnerstag</Label>
        </Field>
        <Field disabled={everyDay} className="flex gap-2">
          <Switch
            checked={friday}
            onChange={() => setFriday(!friday)}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-fuchsia-300 data-disabled:bg-gray-100"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6 data-disabled:text-gray-200" />
          </Switch>
          <Label>Freitag</Label>
        </Field>
        <Field disabled={everyDay} className="flex gap-2">
          <Switch
            checked={saturday}
            onChange={() => setSaturday(!saturday)}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-fuchsia-300 data-disabled:bg-gray-100"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6 data-disabled:text-gray-200" />
          </Switch>
          <Label>Samstag</Label>
        </Field>
        <Field disabled={everyDay} className="flex gap-2">
          <Switch
            checked={sunday}
            onChange={() => setSunday(!sunday)}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-fuchsia-300 data-disabled:bg-gray-100"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6 data-disabled:text-gray-200" />
          </Switch>
          <Label>Sonntag</Label>
        </Field>
      </div>
    </div>
  );
};

type DateAndTimeInputFieldProps = {
  date: string;
  startTime: string;
  endTime: string;
  onChange: (value: {
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
};

const DateAndTimeInput: React.FC<DateAndTimeInputFieldProps> = ({
  date,
  startTime,
  endTime,
  onChange,
}) => {
  return (
    <div className="flex gap-4 justify-center items-center">
      <input
        type="date"
        value={date}
        onChange={(e) => onChange({ date: e.target.value, startTime, endTime })}
        className="border-2 p-2 rounded-xl border-indigo-100"
      />
      <span>:</span>
      <input
        type="time"
        value={startTime}
        onChange={(e) => onChange({ date, startTime: e.target.value, endTime })}
        className="border-2 p-2 rounded-xl border-indigo-100"
      />
      <span>–</span>
      <input
        type="time"
        value={endTime}
        onChange={(e) => onChange({ date, startTime, endTime: e.target.value })}
        className="border-2 p-2 rounded-xl border-indigo-100"
      />
    </div>
  );
};
