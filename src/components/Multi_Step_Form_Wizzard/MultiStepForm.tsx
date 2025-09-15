import { useState } from "react";
import { clsx } from "clsx";

import { WelcomeCustomerStep } from "./SharedStepps/WelcomeCustomerStep";
import { CourseTypeStep } from "./MotionExpert/CourstTypeStep";
import { CourseDetailsStep } from "./MotionExpert/CourseDetailsStep";
import { CourseLocationStep } from "./MotionExpert/CourseLocationStep";
import { CourseAvailabilityStep } from "./MotionExpert/CourseAvailabiltyStep";
import { PhotoUploadStep } from "./SharedStepps/PhotoUploadStep";
import { SummaryStep } from "./SharedStepps/PreviewStep";
import { CoursePricingModellStep } from "./MotionExpert/CoursePricingModellStep";
// import { CompletionStep } from "./SharedStepps/ComplitionStep";

import { Check } from "feather-icons-react";

import { AnimatePresence, motion } from "framer-motion";

// IMPORT TYPES
// import { CourseTypeProps } from "./MotionExpert/CourstTypeStep";

// STEP TYPE
type Step = {
  id: string;
  label: string;
  component: React.FC;
};
export type Role = "motionExpert" | "studioHost" | "athlete";

const getStepsForRole = (role: Role): Step[] => {
  switch (role) {
    case "motionExpert":
      return [
        { id: "welcome", label: "Willkommen", component: WelcomeCustomerStep },
        { id: "courseType", label: "Kurstyp", component: CourseTypeStep },
        { id: "details", label: "Kursdetails", component: CourseDetailsStep },
        { id: "location", label: "Location", component: CourseLocationStep },
        {
          id: "availability",
          label: "Verfügbarkeit",
          component: CourseAvailabilityStep,
        },
        {
          id: "pricing",
          label: "Preismodell",
          component: CoursePricingModellStep,
        },
        { id: "pictures", label: "Fotos", component: PhotoUploadStep },
        { id: "preview", label: "Vorschau", component: SummaryStep },
      ];
    case "studioHost":
      return [
        { id: "welcome", label: "Willkommen", component: WelcomeCustomerStep },
        { id: "course", label: "Kursdetails", component: CourseDetailsStep },
      ];
    case "athlete":
      return [
        { id: "welcome", label: "Willkommen", component: WelcomeCustomerStep },
        { id: "course", label: "Kursdetails", component: CourseDetailsStep },
      ];
    default:
      return [
        { id: "welcome", label: "Willkommen", component: WelcomeCustomerStep },
        { id: "course", label: "Kursdetails", component: CourseDetailsStep },
      ];
  }
};

// MAIN FORM COMPONENT
export const MultiStepForm = ({ role }: { role: Role }) => {
  const steps = getStepsForRole(role);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // const [allStepsCompleted, setAllStepsCompleted] = useState(false);

  const CurrentStep = steps[currentStepIndex].component;

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      console.log(`Current step: ${steps[currentStepIndex].label}`);
    } else {
      console.log("All steps completed");
    }
  };
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      console.log(`Current step: ${steps[currentStepIndex].label}`);
    }
  };

  return (
    <div className="grid grid-cols-[300px_800px] min-h-[800px] bg-white overflow-hidden rounded-4xl shadow-lg p-8">
      {/* STEP INDICATOR */}
      {/* TO DO: Implement possiblity to step by clicking on Step Indicator */}
      <div className="grid grid-cols-1 justify-items-start bg-indigo-400 rounded-2xl p-8 gap-4 shadow-md">
        <h2 className="text-2xl font-semibold text-white">Inserieren</h2>
        {steps.map((steps, index) => (
          <div key={steps.id} className="flex items-center gap-2 mb-4">
            <span
              className={`w-6 h-6 p-1 rounded-full flex items-center justify-center text-indigo-400 font-semibold ${
                index === currentStepIndex && "!bg-fuchsia-300"
              } ${
                index < currentStepIndex && index !== currentStepIndex
                  ? "bg-emerald-400"
                  : "bg-white"
              }`}
            >
              {index >= currentStepIndex ? (
                index + 1
              ) : (
                <Check className="text-white" />
              )}
            </span>
            <span
              className={clsx(
                "font-semibold",
                index < currentStepIndex && index !== currentStepIndex
                  ? "text-emerald-400"
                  : "text-yuvi-white",
                index === currentStepIndex && "!text-fuchsia-300"
              )}
            >
              {steps.label}
            </span>
          </div>
        ))}
      </div>
      {/* FORM CONTENT */}
      <div className="grid grid-rows-[1fr_100px] w-full">
        {/* DYNAMIC STEP COMPONENT */}
        <div className="w-full h-full p-8 justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex} // wichtig: damit die Animation beim Wechsel triggert
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CurrentStep />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* BUTTONS */}
        {/* TO DO: Implemnt First / Submit Button */}
        <div className="flex gap-4 justify-center p-4 w-full h-20">
          {currentStepIndex > 0 && (
            <button
              className="flex justify-center items-center underline underline-offset-8 p-4 rounded-2xl cursor-pointer text-gray-400"
              onClick={prevStep}
            >
              Zurück
            </button>
          )}

          <button
            className="flex justify-center items-center bg-indigo-400 p-4 rounded-2xl cursor-pointer text-yuvi-white hover:bg-fuchsia-300 hover:text-white transition-all"
            onClick={nextStep}
          >
            {currentStepIndex === 0 && "Los gehts"}
            {currentStepIndex !== 0 &&
              currentStepIndex < steps.length - 1 &&
              "weiter"}
            {currentStepIndex === steps.length - 1 && "Launch!"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold text-gray-800">
        Alle Schritte abgeschlossen!
      </h2>
      <p className="text-gray-600 mt-2">Vielen Dank für deine Teilnahme.</p>
    </div>
  );
};
