import { Star } from "feather-icons-react";
import React from "react";
import Image from "next/image";
import { StarRating } from "./StarRating";

interface TestimonialCardProps {
  name?: string;
  image?: string;
  testimonial: string;
  rating: number;
}

const TestimonialCard = ({
  name,
  image,
  testimonial,
  rating,
}: TestimonialCardProps) => {
  return (
    <div className="flex flex-col shadow-lg border border-indigo-50 p-4 rounded-lg aspect-video w-96 gap-4">
      <StarRating rating={rating} />

      <p className="line-clamp-4 text-gray-500">{testimonial}</p>
      <div className="flex gap-4 items-center">
        <div className="flex justify-center items-center h-12 w-12 bg-indigo-200 rounded-full overflow-hidden">
          <Image
            src={image ? image : "/character_placeholder_img.png"}
            alt="Profilbild des Kunden"
            width={48}
            height={48}
            objectFit="cover"
          />
        </div>
        <p className="mt-2 font-bold">{name ? name : "Happy Customer"}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;

// TODO: Random Placeholder Image if no image is provided

export const TestimonialData = [
  {
    name: "Max Mustermann",
    image: "",
    testimonial:
      "Einfach nur großartig! Das Booking war super einfach und die Kommunikation mit dem Team war top! Tolle experience!",
    rating: 5,
  },
  {
    name: "Erika Mustermann",
    image: "",
    testimonial:
      "Ich bin begeistert von der schnellen und unkomplizierten Abwicklung. Immer wieder gerne!",
    rating: 245,
  },
  {
    name: "Hans Müller",
    image: "",
    testimonial:
      "Die Plattform ist sehr benutzerfreundlich und die Auswahl an Dienstleistungen ist riesig.",
    rating: 4,
  },
  {
    name: "Lisa Müller",
    image: "",
    testimonial:
      "Eine tolle Erfahrung! Die Trainer sind super kompetent und die Atmosphäre ist einzigartig.",
    rating: 5,
  },
  {
    name: "Max Mustermann",
    image: "",
    testimonial:
      "Einfach nur großartig! Das Booking war super einfach und die Kommunikation mit dem Team war top! Tolle experience!",
    rating: 5,
  },
  {
    name: "Erika Mustermann",
    image: "",
    testimonial:
      "Ich bin begeistert von der schnellen und unkomplizierten Abwicklung. Immer wieder gerne!",
    rating: 4,
  },
  {
    name: "Hans Müller",
    image: "",
    testimonial:
      "Die Plattform ist sehr benutzerfreundlich und die Auswahl an Dienstleistungen ist riesig.",
    rating: 3,
  },
  {
    name: "Lisa Müller",
    image: "",
    testimonial:
      "Eine tolle Erfahrung! Die Trainer sind super kompetent und die Atmosphäre ist einzigartig.",
    rating: 5,
  },
];
