import { useEffect, useState } from "react";
import { clsx } from "clsx";

import { WelcomeCustomerStep } from "./SharedStepps/WelcomeCustomerStep";
import { SessionTypeStep } from "./MotionExpert/SessionTypeStep";
import { CourseDetailsStep } from "./MotionExpert/CourseDetailsStep";
import { CourseLocationStep } from "./MotionExpert/CourseLocationStep";
import { StudioPricingStep } from "./StudioHost/StudioPricingStep";
import StudioAvailabilityStep from "./StudioHost/StudioAvailabliltyStep";
import { StudioRulesStep } from "./StudioHost/StudioRulesStep";
import { PhotoUploadStep } from "./SharedStepps/PhotoUploadStep";
import { SummaryStep } from "./SharedStepps/PreviewStep";

// import { CompletionStep } from "./SharedStepps/ComplitionStep";

import { Check, CheckCircle } from "feather-icons-react";

import { AnimatePresence, motion } from "framer-motion";
import StudioDetailsStep from "./StudioHost/StudioDetailsStep";

import { superbase } from "@/utils/supabase/superbaseClient";

// IMPORT TYPES
import MultiStepFormDataTypes from "@/types/MultiStepWizzardTypes";

import { uploadFilesToSupabase } from "@/utils/supabase/fileUpload";
import { SessionSlotsStep } from "./MotionExpert/SessionSlotsStep";
import { SessionLocationTypeStep } from "./MotionExpert/SessionLocationType";
import { SelfHostedLocationStep } from "./MotionExpert/SelfHostedLocationStep";

// import { CourseTypeProps } from "./MotionExpert/CourstTypeStep";

// STEP TYPE
type Step = {
  id: string;
  label: string;
  component: React.FC<{
    formData: MultiStepFormDataTypes;
    setFormData: React.Dispatch<React.SetStateAction<MultiStepFormDataTypes>>;
  }>;
};
export type Role = "motionExpert" | "studioHost" | "athlete";

const getStepsForRole = (
  role: Role,
  formData: MultiStepFormDataTypes = {}
): Step[] => {
  switch (role) {
    case "motionExpert": {
      const baseSteps: Step[] = [
        { id: "welcome", label: "Willkommen", component: WelcomeCustomerStep },
        { id: "courseType", label: "Kurstyp", component: SessionTypeStep },
        {
          id: "locationType",
          label: "Location Type",
          component: SessionLocationTypeStep,
        },
      ];

      const locationSteps: Step[] =
        formData.locationType === "self-host"
          ? [
              {
                id: "selfHostedLocation",
                label: "Eigene Location",
                component: SelfHostedLocationStep,
              },
            ]
          : [
              {
                id: "location",
                label: "Studio Location",
                component: CourseLocationStep,
              },
            ];

      const restSteps: Step[] = [
        {
          id: "availability",
          label: "Verfügbarkeit",
          component: SessionSlotsStep,
        },
        {
          id: "details",
          label: "Kursdetails",
          component: CourseDetailsStep,
        },
        { id: "pictures", label: "Fotos", component: PhotoUploadStep },
        { id: "preview", label: "Vorschau", component: SummaryStep },
      ];

      return [...baseSteps, ...locationSteps, ...restSteps];
    }

    case "studioHost":
      return [
        { id: "welcome", label: "Willkommen", component: WelcomeCustomerStep },
        {
          id: "studioDetails",
          label: "Studio Details",
          component: StudioDetailsStep,
        },
        {
          id: "availability",
          label: "Verfügbarkeit",
          component: StudioAvailabilityStep,
        },
        { id: "pricing", label: "Preismodell", component: StudioPricingStep },
        { id: "pictures", label: "Fotos", component: PhotoUploadStep },
        { id: "rules", label: "Hausregeln", component: StudioRulesStep },
        { id: "preview", label: "Vorschau", component: SummaryStep },
      ];
    default:
      return [
        { id: "welcome", label: "Willkommen", component: WelcomeCustomerStep },
      ];
  }
};

// const {
//   data: { user },
// } = await superbase.auth.getUser();

// MAIN FORM COMPONENT
export const MultiStepForm = ({ role }: { role: Role }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<MultiStepFormDataTypes>({});
  const steps = getStepsForRole(role, formData);
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

  const resetForm = () => {
    setFormData({});
    setCurrentStepIndex(0);
  };

  const handleSubmit = async (
    formData: MultiStepFormDataTypes,
    userId: string
  ) => {
    if (!userId) return;

    const previewImagesURI = await uploadFilesToSupabase(
      formData.uploadedFiles || [],
      userId
    );

    if (role === "studioHost") {
      const { error } = await superbase.from("studios").insert([
        {
          user_id: userId,
          studio_name: formData.studioName,
          studio_address: formData.studioAddress,
          contact_number: formData.contactNumber,
          studio_size: formData.studioSize,
          studio_description: formData.studioDescription,
          amenities: formData.amenities,
          availability: formData.studioAvailability,
          image_previews: previewImagesURI,

          ratings: { stars: 0, reviews: [] },
        },
      ]);

      if (error) {
        console.error("Fehler beim Speichern des Studios:", error);
        return false;
      }
      console.log("Studio erfolgreich gespeichert!");
    }

    if (role === "motionExpert") {
      const { error } = await superbase.from("courses").insert([
        {
          user_id: userId,
          // course_type: formData.courseType,
          // course_title: formData.courseTitle,
          // course_description: formData.courseDescription,
          // course_location: formData.courseLocation,
          // course_address: formData.courseAddress,
          // course_date: formData.courseDate,
          // course_time: formData.courseTime,
          // pricing_model: formData.pricingModel,
          // price: formData.price,
          // currency: formData.currency,
          image_previews: previewImagesURI,

          ratings: { stars: 0, reviews: [] },
        },
      ]);

      if (error) {
        console.error("Fehler beim Speichern der Session:", error);
        return false;
      }
      console.log("Session erfolgreich gespeichert!");
    }
    setShowSuccess(true);
    resetForm();
    return true;
  };

  // // Fallback bei gelöschtem Step:
  // useEffect(() => {
  //   if (currentStepIndex >= steps.length) {
  //     setCurrentStepIndex(steps.length - 1);
  //   }
  // }, [steps.length, currentStepIndex]);

  return (
    <div className="relative grid grid-cols-[300px_800px] min-h-[800px] bg-white overflow-hidden rounded-4xl shadow-lg p-8">
      <SuccessMessage success={showSuccess} />
      {/* STEP INDICATOR */}
      {/* TO DO: Implement possiblity to step by clicking on Step Indicator */}
      <div className="grid grid-cols-1 justify-items-start bg-indigo-400 rounded-2xl p-8 gap-4 shadow-md">
        <h2 className="text-2xl font-semibold text-white">Steps</h2>
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
              key={steps[currentStepIndex].id} // stabile, eindeutige ID!
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex items-center justify-center"
            >
              <CurrentStep formData={formData} setFormData={setFormData} />
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
            // onClick={
            //   currentStepIndex === steps.length - 1
            //     ? async () => {
            //         // Replace with actual userId retrieval logic
            //         const userId = user?.id;
            //         if (!userId) {
            //           console.error("User ID not found. Cannot submit form.");
            //           return;
            //         }
            //         console.log("Submitting form with data:", formData);
            //         await handleSubmit(formData, userId);
            //       }
            //     : nextStep
            // }
          >
            {currentStepIndex === 0 && "Los gehts"}
            {currentStepIndex !== 0 &&
              currentStepIndex < steps.length - 1 &&
              "weiter"}
            {currentStepIndex === steps.length - 1 && role === "studioHost"
              ? "Hosten!"
              : null}
            {currentStepIndex === steps.length - 1 && role === "motionExpert"
              ? "Launchen!"
              : null}
          </button>
        </div>
      </div>
    </div>
  );
};

const SuccessMessage = ({ success }: { success: boolean }) => {
  const [isVisible, setIsVisible] = useState(success);
  return (
    <div
      className={
        "absolute flex-col items-center justify-center h-full bg-transparent w-full z-10 pointer-events-none backdrop-blur-sm" +
        (isVisible ? " flex" : " hidden")
      }
    >
      <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center pointer-events-auto border border-slate-200">
        <CheckCircle className="text-9xl text-emerald-400 mb-4 animate-bounce h-10 w-10" />
        <h2 className="text-2xl font-bold text-indigo-400">
          Alle Schritte abgeschlossen!
        </h2>
        <p className="text-slate-500 mt-2">Vielen Dank für deine Teilnahme.</p>
        <div className="mt-4">
          <button
            className="bg-indigo-400 p-2 rounded-lg text-white hover:bg-fuchsia-300 cursor-pointer transition-all"
            onClick={() => setIsVisible(false)}
          >
            Neues Formular Starten
          </button>
        </div>
      </div>
    </div>
  );
};
