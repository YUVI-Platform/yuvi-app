type MultiStepFormDataTypes = {
  uploadedFiles?: File[];
  imagePreviews?: string[];
  studioName?: string;
  studioAddress?: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  contactNumber?: string;
  studioSize?: number;
  studioDescription?: string;
  amenities?: string[];
  studioAvailability?: {
    startDate?: string;
    endDate?: string;
    weeklySchedule?: { day: string; from: string; to: string }[];
  };
};
export default MultiStepFormDataTypes;
