"use client";
import MultiStepFormDataTypes from "@/types/MultiStepWizzardTypes";
import { ImagePreviewCarousel } from "@/components/Images/ImagePreviewCarousel";

export const SummaryStep = ({
  formData,
}: {
  formData: MultiStepFormDataTypes;
}) => {
  return (
    <div className="flex flex-col items-center  h-full w-full bg-indigo-50 rounded-2xl overflow-hidden overflow-y-scroll">
      <h1 className="text-md flex bg-red-500 text-white w-full justify-center p-1">
        Bitte überprüfe deine Eingaben.
      </h1>
      <ImagePreviewCarousel
        imagePreviews={
          formData.imagePreviews || ["/landingpage-placeholder.avif"]
        }
      />
      <div className="flex flex-col items-start px-4 w-full gap-4 overflow-hidden overflow-y-scroll p-4 max-h-80">
        <span className="text-3xl font-bold text-indigo-400 mt-4 w-full">
          {formData.studioName}
        </span>
        <span className="text-xl text-slate-600 mt-4 w-full">
          {formData?.studioAvailability?.startDate &&
          formData?.studioAvailability?.endDate
            ? `${new Date(
                formData.studioAvailability.startDate
              ).toLocaleDateString()} bis ${new Date(
                formData.studioAvailability.endDate
              ).toLocaleDateString()}`
            : "..."}
        </span>

        <span className="text-md text-gray-600 mt-1 w-full">
          {formData?.studioAddress?.street
            ? `${formData.studioAddress?.street}, ${formData.studioAddress?.zip} ${formData.studioAddress?.city}`
            : "Keine Adresse angegeben"}
        </span>
        <span>
          {formData.studioSize && (
            <span className="text-md text-gray-600 mt-1 w-full">
              Studio Größe: {formData.studioSize} m²
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          {formData.amenities?.map((amenity, index) => (
            <span
              key={index}
              className="text-md text-slate-600 bg-slate-300 flex justify-center items-center w-full rounded-full px-2 py-1"
            >
              {amenity}
            </span>
          ))}
        </span>
        <span className="text-md text-gray-600 mt-1 w-full">
          {formData.studioDescription || "Keine Beschreibung angegeben"}
        </span>
        <span>
          {formData.studioAvailability?.weeklySchedule?.map((day) => (
            <div
              key={day.day + day.from + day.to}
              className="text-md text-gray-600 mt-1 w-full"
            >
              {day.day}: {day.from} - {day.to}
            </div>
          ))}
        </span>
      </div>
    </div>
  );
};

export default SummaryStep;
