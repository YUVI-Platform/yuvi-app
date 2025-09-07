import Link from "next/link";
import TestimonialCard, { TestimonialData } from "../Cards/TestimonialCard";

export const TestimonialSection = () => {
  return (
    <section className="flex flex-col relative py-12 justify-center items-center">
      <h2 className="text-3xl text-center font-bold mb-6 mt-14 text-indigo-400">
        Was unsere Kunden sagen!
      </h2>

      <div className=" relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[500px] overflow-y-scroll overflow-box-scroll-hidden pb-56">
        {TestimonialData.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
      <div className="bg-gradient-to-t from-white to-30% to-transparent absolute inset-0 z-0 pointer-events-none" />
      <Link
        href="/testimonials"
        className=" relative bg-indigo-400 text-white py-2 px-4 rounded z-10 w-full max-w-fit"
      >
        Alle Testimonials ansehen
      </Link>
    </section>
  );
};
