import { QuestionAnswerBlock } from "./QuestionAnswerBlock";

export const FAQBlock = () => {
  return (
    <div className="flex flex-col w-full max-w-[800px] rounded-2xl border border-white justify-center items-center shadow-lg px-8 pt-8 pb-12 mb-20">
      <h2 className="text-4xl font-bold text-indigo-400 mb-8">
        Du hast Fragen? Wir haben die Antworten.
      </h2>
      <ul className="w-full">
        <QuestionAnswerBlock question="Frage 1" answer="Antwort auf Frage 1" />
        <QuestionAnswerBlock question="Frage 2" answer="Antwort auf Frage 2" />
      </ul>
    </div>
  );
};
