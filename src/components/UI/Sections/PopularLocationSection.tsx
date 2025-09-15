import { CourseLocationCard } from "../Cards/LocationCards";
import { locations } from "@/testdata/locationData";

export default function PopularLocationSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
      {locations.map((loc) => (
        <CourseLocationCard
          key={loc.id}
          name={loc.name}
          address={loc.address}
          size={loc.size}
          availableFrom={loc.availableFrom}
          availableTo={loc.availableTo}
          features={loc.features}
          rating={loc.rating}
          imageUrl={loc.imageUrl}
        />
      ))}
    </section>
  );
}
