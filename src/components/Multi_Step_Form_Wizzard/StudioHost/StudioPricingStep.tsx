"use client";
import { useState } from "react";

export const StudioPricingStep = () => {
  const [isFlatRate, setIsFlatRate] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-4xl">Wähle ein Preismodell</h1>

      <label htmlFor="percentage" className="flex items-center gap-2">
        Prozentsatz
        <input
          type="checkbox"
          id="percentage"
          checked={isFlatRate}
          onChange={() => setIsFlatRate(!isFlatRate)}
        />
      </label>
      {isFlatRate ? (
        <input
          type="number"
          placeholder="Prozent des Motionexpert Umsatzes"
          className="border-2 p-2 rounded-xl border-indigo-100 w-full"
        />
      ) : (
        <input
          type="number"
          placeholder="Pauschale in €"
          className="border-2 p-2 rounded-xl border-indigo-100 w-full"
        />
      )}
    </div>
  );
};
