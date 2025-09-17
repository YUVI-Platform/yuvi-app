"use client";
import { useSupabaseUser } from "@/utils/supabase/getUser";
import { Layout, LogOut, PlusCircle, Settings } from "feather-icons-react";
import Link from "next/link";
import React from "react";

export default function SideNav() {
  const { user } = useSupabaseUser();
  return (
    <aside className="w-full h-screen p-8 bg-transparent">
      <nav className="flex flex-col shadow-xl rounded-3xl overflow-hidden h-full bg-white justify-between">
        <div className="flex flex-col">
          <h2 className="px-4 pt-8 pb-4 font-bold text-2xl text-indigo-400">
            Hey {user?.user_metadata ? user.user_metadata.userName : "..."}!
          </h2>
          <Link
            href="/dashboard"
            className="p-4 hover:bg-indigo-50 hover:text-indigo-500 flex w-full items-center"
          >
            <Layout className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/advert"
            className="p-4 hover:bg-indigo-50 hover:text-indigo-500 flex w-full items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Neues Inserat
          </Link>
        </div>
        <div className="flex flex-col items-center w-full">
          <Link
            href="/profile"
            className="flex w-full gap-4 p-4 hover:bg-indigo-50 hover:text-indigo-500 "
          >
            <Settings className="h-5 w-5" />
            Profil Einstellungen
          </Link>
          <button
            className="flex w-full gap-4 p-4 hover:bg-red-500 hover:text-white text-red-500 cursor-pointer"
            onClick={async () => {
              const res = await fetch("/api/auth/logout", {
                method: "POST",
              });
              if (res.ok) {
                window.location.href = "/login";
              }
            }}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
