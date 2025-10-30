// components/FAQSection.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQData = [
  {
    title: "What is YUVi?",
    answer:
      "YUVi is a platform that connects motion experts, athletes, and studio hosts to make training accessible anywhere.",
  },
  {
    title: "How can I become a Motion Expert?",
    answer:
      "Simply register on YUVi, create a profile, and start offering your own classes at studios or your favorite spots.",
  },
  {
    title: "What is a Studio Host?",
    answer:
      "A Studio Host owns or manages a location that can be rented out by Motion Experts for classes.",
  },
  {
    title: "Do I need equipment to join a session?",
    answer:
      "It depends on the session. Each class includes recommendations on what to bring, such as a yoga mat or towel.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="flex flex-col md:flex-row w-full max-w-[1920px] mx-auto py-20 px-4 sm:px-6 lg:px-20">
      <h2 className=" flex w-full text-6xl font-semibold mb-12">
        You Have Questions? <br /> We Have Answers!
      </h2>

      <div className="flex w-full flex-col gap-4">
        {FAQData.map((faq, index) => (
          <div
            key={index}
            className="border bg-yuvi-skyblue rounded-2xl overflow-hidden text-white"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex justify-between items-center px-6 py-4 text-left text-2xl font-semibold text-white"
            >
              {faq.title}
              {openIndex === index ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pt-0 pb-4 text-lg text-gray-50"
                >
                  {faq.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
