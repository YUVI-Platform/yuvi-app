import { QuestionAnswerBlock } from "./QuestionAnswerBlock";
import { FAQ_MOCK } from "@/testdata/faqData";

export const FAQBlock = () => {
  return (
    <section className="flex flex-col w-full max-w-[800px] rounded-2xl border border-white justify-center items-center shadow-lg px-4 pt-8 pb-12 mb-20">
      <h2 className="text-4xl text-indigo-400 mb-8">
        Du hast Fragen? Wir haben die Antworten.
      </h2>
      <ul className="w-full">
        {FAQ_MOCK.map((item, index) => (
          <QuestionAnswerBlock
            key={index}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </ul>
    </section>
  );
};
