"use client";

import { ChevronDown, ChevronUp } from "feather-icons-react";
import { useState } from "react";

export const QuestionAnswerBlock = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex flex-col w-full h-fit p-4 rounded-2xl border border-indigo-400 mb-4 transition-all duration-200 ease-in-out hover:bg-indigo-400 hover:text-white cursor-pointer">
      <button
        className="flex justify-between items-center w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold">{question}</h3>

        <div>{isOpen ? <ChevronUp /> : <ChevronDown />}</div>
      </button>
      {isOpen && <p>{answer}</p>}
    </div>
  );
};
