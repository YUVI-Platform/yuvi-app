"use client";

import { MultiStepForm } from "../../../../components/Multi_Step_Form_Wizzard/MultiStepForm";
import { useEffect } from "react";
import { useUserRole } from "@/utils/supabase/getUser";
const AdvertPage = () => {
  const userRole = useUserRole();

  useEffect(() => {
    if (userRole === "athlete") {
      // Redirect or show a message for athletes
    } else if (userRole === "motionExpert") {
      // Redirect or show a message for motion experts
    } else if (userRole === "studioHost") {
      // Redirect or show a message for studio hosts
    }
  }, [userRole]);
  return (
    <main className="flex flex-col items-center justify-center h-screen w-full bg-indigo-50">
      {userRole ? <MultiStepForm role={userRole} /> : <p>Loading...</p>}
    </main>
  );
};
export default AdvertPage;
