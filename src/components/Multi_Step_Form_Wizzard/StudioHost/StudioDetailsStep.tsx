"use client";
import MultiStepFormDataTypes from "@/Types/MultiStepWizzardTypes";

const amenitieOptions = [
  "Wifi",
  "WC",
  "Küche",
  "Parkplatz",
  "Duschen",
  "Umkleide",
  "Lichtanlage",
  "Soundanlage",
];

const StudioDetailsStep = ({
  formData,
  setFormData,
}: {
  formData: MultiStepFormDataTypes;
  setFormData: React.Dispatch<React.SetStateAction<MultiStepFormDataTypes>>;
}) => {
  // Hilfsfunktion für Toggle
  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const currentAmenities = prev.amenities || [];
      if (currentAmenities.includes(amenity)) {
        return {
          ...prev,
          amenities: currentAmenities.filter((a) => a !== amenity),
        };
      } else {
        return {
          ...prev,
          amenities: [...currentAmenities, amenity],
        };
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-2xl font-bold text-gray-800">Studio Details</h2>

      <input
        type="text"
        placeholder="Studio Name"
        value={formData.studioName || ""}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, studioName: e.target.value }))
        }
        className="mt-4 p-2 border border-gray-300 rounded-md w-64"
      />

      <input
        type="text"
        placeholder="Straße"
        value={formData?.studioAddress?.street || ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            studioAddress: { ...prev.studioAddress, street: e.target.value },
          }))
        }
        className="mt-4 p-2 border border-gray-300 rounded-md w-64"
      />
      <input
        type="text"
        placeholder="Stadt"
        value={formData?.studioAddress?.city || ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            studioAddress: { ...prev.studioAddress, city: e.target.value },
          }))
        }
        className="mt-4 p-2 border border-gray-300 rounded-md w-64"
      />
      <input
        type="text"
        placeholder="PLZ"
        value={formData?.studioAddress?.zip || ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            studioAddress: { ...prev.studioAddress, zip: e.target.value },
          }))
        }
        className="mt-4 p-2 border border-gray-300 rounded-md w-64"
      />

      <input
        type="number"
        placeholder="Studio Size in m²"
        step="0.1"
        value={formData.studioSize || ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            studioSize:
              e.target.value === "" ? undefined : Number(e.target.value),
          }))
        }
        className="mt-4 p-2 border border-gray-300 rounded-md w-64"
      />

      <textarea
        placeholder="Studio Description"
        value={formData.studioDescription || ""}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            studioDescription: e.target.value,
          }))
        }
        className="mt-4 p-2 border border-gray-300 rounded-md w-64 h-32"
      ></textarea>

      <h2>Wähle deine Ausstattung</h2>
      <div className="grid grid-cols-3">
        {amenitieOptions.map((amenity) => (
          <button
            key={amenity}
            type="button"
            onClick={() => toggleAmenity(amenity)}
            className={`m-1 px-3 py-1 rounded-full border ${
              formData?.amenities?.includes(amenity)
                ? "bg-indigo-400 text-white border-indigo-400"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {amenity}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudioDetailsStep;
