"use client";
// import { useSupabaseUser } from "@/utils/supabase/getUser";
export default function UserDashboardPage() {
  // const { user } = useSupabaseUser();
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="grid grid-cols-12 grid-rows-12 gap-4 h-full w-full bg-indigo-100 rounded-4xl my-8 mr-8 p-8">
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
        <div className="bg-red-500/50 col-span-1 row-span-full rounded-4xl p-4" />
      </div>
    </div>
  );
}
