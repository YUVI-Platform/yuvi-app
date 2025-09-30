import { StudioCard } from "../Cards/StudioCards";
import { locations } from "@/testdata/locationData";

export default function PopularLocationSection() {
  return (
    <section className="flex flex-col justify-center items-center w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-12">
        <h3 className="text-base sm:text-lg text-slate-700 mb-2 sm:mb-3">
          Unsere Studios
        </h3>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-indigo-400">
          Your Space To Move!
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-0">
        {locations.map((loc) => (
          <StudioCard
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
      </div>
    </section>
  );
}
