import React, { useState } from "react";

// Eine Liste von Städten, die im Dropdown angezeigt werden sollen
import { cities } from "../../testdata/locationData";

export const CitySelector = () => {
  // useState speichert die ausgewählte Stadt
  const [selectedCity, setSelectedCity] = useState("");

  // Die Funktion wird aufgerufen, wenn der Wert im Dropdown sich ändert
  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  return (
    <select
      id="city-select"
      value={selectedCity}
      onChange={handleCityChange}
      className="flex w-full min-h-14 justify-between border-2 border-indigo-200 rounded-2xl text-indigo-400 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      {/* Die erste Option ist ein Platzhalter */}
      <option value="" disabled>
        {selectedCity ? selectedCity : "Stadt auswählen"}
      </option>
      {/* Wir gehen die Liste der Städte durch und erstellen für jede eine Option */}
      {cities.map((city) => (
        <option key={city.id} value={city.name}>
          {city.name}
        </option>
      ))}
    </select>
  );
};
