import { Layout, PlusCircle, Settings } from "feather-icons-react";
import Link from "next/link";
import React from "react";

export default function SideNav() {
  return (
    <aside className="w-full h-screen p-8 bg-transparent">
      <nav className="flex flex-col shadow-xl rounded-3xl overflow-hidden h-full bg-white justify-between">
        <div className="flex flex-col">
          <h2 className="px-4 pt-8 pb-4 font-bold text-2xl text-indigo-400">
            Willkommen zurück!
          </h2>
          <Link
            href="/userdashboard"
            className="p-4 hover:bg-indigo-50 hover:text-indigo-500 flex w-full items-center"
          >
            <Layout className="h-5 w-5 mr-2" />
            Dashboard
          </Link>
          <Link
            href="/userdashboard/advert"
            className="p-4 hover:bg-indigo-50 hover:text-indigo-500 flex w-full items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Neues Inserat
          </Link>
        </div>
        <div className="flex items-center w-full">
          <Link
            href="/profile"
            className="flex w-full gap-4 p-4 hover:bg-indigo-50 hover:text-indigo-500 "
          >
            <Settings className="h-5 w-5" />
            Profil Einstellungen
          </Link>
        </div>
      </nav>
    </aside>
  );
}
