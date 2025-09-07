import { Star } from "feather-icons-react";

export const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={index < rating ? "text-indigo-400" : "text-indigo-200"}
          fill={"currentColor"}
        />
      ))}
    </div>
  );
};
