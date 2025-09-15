import TestimonialCard, { TestimonialData } from "../Cards/TestimonialCard";

export default function TestimonialSection() {
  return (
    <section className="flex flex-col relative py-12 justify-center items-center">
      <h2 className="text-3xl text-center mb-6 mt-14 text-indigo-400">
        Das sagen unsere Kunden!
      </h2>

      <div className=" relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {TestimonialData.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
    </section>
  );
}
