"use client";
import { useSupabaseUser } from "@/utils/supabase/getUser";
export default function UserDashboardPage() {
  const { user } = useSupabaseUser();
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      User Dashboard – Wow voll leer hier!
      <p>Your role is: {user?.user_metadata?.role}</p>
    </div>
  );
}
