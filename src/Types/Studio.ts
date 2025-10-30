export interface StudioCardProps {
  name: string;
  address: string;
  size: string;
  availableFrom: string;
  availableTo: string;
  features: string[];
  rating: number;
  imageUrl: string;
}

export interface StudioProps {
  name: string;
  uploaded_files?: File[];
  image_previews?: string[];
  studio_name?: string;
  studio_address?: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  studio_size?: number;
  studio_description?: string;
  amenities?: string[];
  availability?: {
    startDate?: string;
    endDate?: string;
    weeklySchedule?: { day: string; from: string; to: string }[];
  };
  ratings?: {
    stars?: number;
    reviews?: string[];
  };

  user_id?: string;
  price?: number;
}

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
