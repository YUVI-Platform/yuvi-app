import Link from "next/link";
import React from "react";
import MultiStepFormDataTypes from "@/types/MultiStepWizzardTypes";

export const SelfHostedLocationStep = ({
  formData,
  setFormData,
}: {
  formData: MultiStepFormDataTypes;
  setFormData: React.Dispatch<React.SetStateAction<MultiStepFormDataTypes>>;
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-4xl">Wo finden deine Sessions statt?</h1>
      <input
        type="text"
        placeholder="Location Name"
        className="border-2 p-2 rounded-xl border-indigo-100 w-full"
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            studioAddress: { ...prev.studioAddress, city: e.target.value },
          }))
        }
      />
      <input
        type="text"
        placeholder="Gib die Adresse deines Studios ein..."
        className="border-2 p-2 rounded-xl border-indigo-100 w-full"
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            studioAddress: { ...prev.studioAddress, street: e.target.value },
          }))
        }
      />
      <div>
        <label htmlFor="indoor" className="mt-4">
          Indoor Session
          <input
            type="checkbox"
            id="indoor"
            className="mt-4"
            checked={formData.selfHostedLocationDetails?.indoor ?? false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                selfHostedLocationDetails: {
                  ...prev.selfHostedLocationDetails,
                  indoor: e.target.checked,
                  outdoor: prev.selfHostedLocationDetails?.outdoor ?? false,
                },
              }))
            }
          />
        </label>
        <label htmlFor="outdoor" className="mt-4">
          Outdoor Session
          <input
            type="checkbox"
            id="outdoor"
            className="mt-4"
            checked={formData.selfHostedLocationDetails?.outdoor ?? false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                selfHostedLocationDetails: {
                  ...prev.selfHostedLocationDetails,
                  indoor: prev.selfHostedLocationDetails?.indoor ?? false,
                  outdoor: e.target.checked,
                },
              }))
            }
          />
        </label>
      </div>
      <input
        type="number"
        placeholder="Maximale Teilnehmerzahl"
        className="border-2 p-2 rounded-xl border-indigo-100 w-full"
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            studioAddress: { ...prev.studioAddress, city: e.target.value },
          }))
        }
      />
      <label htmlFor="AGB" className="mt-4">
        Ich akzeptiere die{" "}
        <Link
          href="/legal/agb"
          target="_blank"
          className="text-blue-500 underline font-bold"
        >
          AGBs
        </Link>{" "}
        und die damit verbundene Stornierungs richtlinien
        <input type="checkbox" id="AGB" className="mt-4" />
      </label>
      <p>TODO: MAP OPTION HINZUFÜGEN</p>
    </div>
  );
};
