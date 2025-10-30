"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const FeatureSection = () => {
  return (
    <div className="relative flex flex-col w-full md:p-16 gap-16 max-w-[1920px]">
      <FeatureCard
        title="Transform Your Space"
        text="Transform underutilized spaces into vibrant hubs for movement and wellness activities. Whether it's a vacant lot, an empty studio, or a quiet park, YUVi helps you discover and book the perfect spot to get moving."
        imageSrc="/2-location-test-image.webp"
        color="skyblue"
      />
      <FeatureCard
        title="Host Effortlessly"
        text="List your space, set your availability, and let athletes find you. Our platform makes it easy to manage bookings and maximize your space."
        imageSrc="/jonas_m.jpg"
        color="blue"
      />
      <FeatureCard
        title="Join the Movement"
        text="Find your next training session, connect with trainers, or explore unique locations tailored to your fitness goals."
        imageSrc="/landingpage-placeholder.avif"
        color="rose"
      />
    </div>
  );
};
export default FeatureSection;

const FeatureCard = ({
  title,
  text,
  imageSrc,
  color,
}: {
  title: string;
  text: string;
  imageSrc: string;
  color?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], ["4deg", "0deg"]);

  const springY = useSpring(y, { stiffness: 100, damping: 20 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 20 });
  const springRotate = useSpring(rotate, { stiffness: 100, damping: 20 });

  const bgcolor =
    color === "blue"
      ? "bg-yuvi-blue"
      : color === "skyblue"
      ? "bg-yuvi-skyblue"
      : "bg-yuvi-rose";

  return (
    <motion.div
      ref={ref}
      style={{
        y: springY,
        scale: springScale,
        rotate: springRotate,
      }}
      className={`relative flex flex-col sm:flex-row rounded-4xl ${bgcolor} text-white px-6 py-12 sm:p-20 h-[90vh] sm:h-[80vh] justify-between shadow-xl overflow-hidden`}
    >
      {/* Content */}
      <div className="flex flex-col gap-4 max-w-full sm:max-w-5xl z-10">
        <h2 className="text-4xl sm:text-7xl font-bold mb-4">{title}</h2>
        <p className="text-lg sm:text-2xl font-medium">{text}</p>
        <button className="border-2 border-white w-fit mt-4 py-2 px-4 rounded-2xl text-lg sm:text-2xl flex items-center font-bold transition">
          Get Started as Studio Host
          <ArrowRight className="ml-2 bg-white text-yuvi-skyblue rounded-lg p-1 sm:p-2 w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Image */}
      <Image
        src={imageSrc}
        width={400}
        height={300}
        alt={title}
        className="absolute bottom-8 right-1/2 sm:right-20 translate-x-1/2 sm:translate-x-0 rotate-6 w-64 sm:w-[400px] h-96 sm:h-[600px] object-cover rounded-4xl z-0"
      />
    </motion.div>
  );
};
