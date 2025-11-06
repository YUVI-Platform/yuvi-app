"use client";
import { useSupabaseUser } from "@/utils/supabase/getUser";
import { Layout, LogOut, Settings } from "feather-icons-react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseBrowser";

import {
  AdminSideNavData,
  MotionExpertSideNavData,
  AthleteSideNavData,
  StudioHostSideNavData,
} from "@/data/sideNavData";

import { SideNavItemType } from "@/types/Navigation";

export default function SideNav() {
  const { user } = useSupabaseUser();
  const router = useRouter(); // ← brauchst du für Redirect

  let SideNavData: SideNavItemType[] = [];
  if (user?.user_metadata.role === "admin") {
    SideNavData = AdminSideNavData;
  } else if (user?.user_metadata.role === "motionExpert") {
    SideNavData = MotionExpertSideNavData;
  } else if (user?.user_metadata.role === "studioHost") {
    SideNavData = StudioHostSideNavData;
  } else if (user?.user_metadata.role === "athlete") {
    SideNavData = AthleteSideNavData;
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (!res.ok) throw new Error("Server logout failed");
      await supabase.auth.signOut(); // Clientseitiges Supabase-Session-Cleanup
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <aside className="w-full h-screen p-8 bg-transparent">
      <nav className="flex flex-col shadow-xl rounded-3xl overflow-hidden h-full bg-white justify-between">
        <div className="flex flex-col">
          <h2 className="px-4 pt-8 pb-4 font-bold text-4xl text-yuvi-rose font-fancy">
            {`Hey ${user?.user_metadata?.userName ?? "..."}`.toUpperCase()}
          </h2>
          <Link
            href="/dashboard"
            className="p-4 hover:bg-indigo-50 hover:text-indigo-500 flex w-full items-center"
          >
            <Layout className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
          {SideNavData.map((item) => (
            <Link
              key={item.name + item.href}
              href={item.href}
              className="p-4 hover:bg-indigo-50 hover:text-indigo-500 flex w-full items-center"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-col items-center w-full">
          <Link
            href="/dashboard/profile"
            className="flex w-full gap-4 p-4 hover:bg-indigo-50 hover:text-indigo-500"
          >
            <Settings className="h-5 w-5" />
            Profil Einstellungen
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full gap-4 p-4 hover:bg-red-500 hover:text-white text-red-500 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
