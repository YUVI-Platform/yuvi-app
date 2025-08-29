"use client";

import { MultiStepForm } from "../../../components/Multi_Step_Form_Wizzard/MultiStepForm";

const AdvertPage = () => {
  return (
    <main className="flex flex-col items-center justify-center h-screen w-full bg-indigo-50">
      <MultiStepForm role={"motionExpert"} />
    </main>
  );
};
export default AdvertPage;
