import { useUserRole } from "@/utils/supabase/getUser";

export const WelcomeCustomerStep = () => {
  const userRole = useUserRole();
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold text-gray-800">
        {userRole === "studioHost"
          ? "Bereit ein neues Studio zu Hosten?"
          : "Bereit eine neue Session zu starten?"}
      </h2>
      <p className="text-gray-600 mt-2">Dann lass uns beginnen!</p>
    </div>
  );
};
