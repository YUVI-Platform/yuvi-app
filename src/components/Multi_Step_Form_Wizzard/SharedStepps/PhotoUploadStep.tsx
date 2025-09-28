"use client";

import { useState } from "react";
import Image from "next/image";
import MultiStepFormDataTypes from "@/Types/MultiStepWizzardTypes";

export const PhotoUploadStep = ({
  formData,
  setFormData,
}: {
  formData: MultiStepFormDataTypes;
  setFormData: React.Dispatch<React.SetStateAction<MultiStepFormDataTypes>>;
}) => {
  const [error, setError] = useState<string | null>(null);
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    newFiles.forEach((file) => {
      if (file.size > maxFileSize) {
        setError(`"${file.name}" ist größer als 5MB.`);
        return;
      }

      if (formData.uploadedFiles?.find((f) => f.name === file.name)) {
        setError(`"${file.name}" wurde bereits hochgeladen.`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        uploadedFiles: [...(prev.uploadedFiles || []), ...validFiles],
        imagePreviews: [...(prev.imagePreviews || []), ...newPreviews],
      }));
      setError(null);
    }
  };

  const removeImage = (index: number) => {
    const updatedFiles = (formData.uploadedFiles || []).filter(
      (_, i) => i !== index
    );
    const updatedPreviews = (formData.imagePreviews || []).filter(
      (_, i) => i !== index
    );

    setFormData((prev) => ({
      ...prev,
      uploadedFiles: updatedFiles,
      imagePreviews: updatedPreviews,
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Bitte lade deine Fotos hoch
      </h2>
      <p className="text-gray-600 mt-2">Maximale Dateigröße: 5MB</p>

      <input
        type="file"
        accept="image/*"
        className="mt-2 p-2 border border-gray-300 rounded-lg"
        onChange={handlePhotoUpload}
        multiple
      />

      {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

      {formData.imagePreviews && formData.imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4 p-8 w-full max-h-[400px] overflow-y-scroll">
          {formData.imagePreviews.map((src, index) => (
            <div
              key={index}
              className="relative group border rounded-lg overflow-hidden"
            >
              <Image
                src={src}
                alt={`Preview ${index}`}
                className="w-full h-32 object-cover"
                width={1280}
                height={720}
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-90 hover:opacity-100"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
