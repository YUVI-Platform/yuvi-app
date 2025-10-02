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
  studioCapacity?: number;
  studioDescription?: string;
  amenities?: string[];
  studioAvailability?: {
    startDate?: string;
    endDate?: string;
    weeklySchedule?: { day: string; from: string; to: string }[];
  };
  // Motion Expert Fields
  sessionTypes?: string[];
  sessionTitles?: string[];
  sessionDescriptions?: string[];
  sessionTags?: string[];
  sessionDuration?: number;
  sessionPrice?: number;
  sessionPricing?: number;
};
export default MultiStepFormDataTypes;
