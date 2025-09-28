/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useSupabaseUser } from "@/utils/supabase/getUser";
import clsx from "clsx";
import { Edit } from "feather-icons-react";
import Image from "next/image";
import { useState } from "react";

// TODO: Delete all unsused console.logs

export default function ProfilePage() {
  const { user } = useSupabaseUser();

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="grid grid-cols-12 grid-rows-12 gap-4 h-full w-full bg-indigo-100 rounded-4xl my-8 mr-8 p-8">
        <MemberCard user={user} />
      </div>
    </div>
  );
}

const MemberCard = ({ user }: { user: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div
      className={
        "relative flex flex-col col-span-4 row-span-4 rounded-4xl p-6 bg-white shadow-lg transition-transform duration-150 group z-10 hover:scale-101"
      }
    >
      <div className="flex justify-between">
        <button
          onClick={() => {
            setIsEditing(!isEditing);
          }}
          className="absolute text-slate-400 rounded-lg p-2 z-10 bottom-0 right-0 m-4 hover:bg-slate-100  items-center cursor-pointer hidden group-hover:block"
        >
          <Edit />
        </button>
        <div className="w-full flex flex-col justify-between">
          <h1 className="text-lg font-semibold text-slate-400">Member Card</h1>
          <h2
            className="text-5xl font-bold editing"
            contentEditable={isEditing}
            onChange={(e) => {
              console.log(e);
            }}
          >
            {user?.user_metadata?.userName ?? "..."}
          </h2>
        </div>
        <Image
          src="/jonas_m.jpg"
          alt="Profile Image"
          className="rounded-3xl  aspect-square"
          width={100}
          height={100}
        />
      </div>
      <div className="flex flex-col h-full mt-4">
        <div className="flex flex-col gap-4 text-lg text-slate-500">
          <p>Geburtsdatum: 01.01.1990</p>
          <p>Telefon: 01234 567890</p>
          <p>Email: jonas.mueller@example.com</p>
        </div>
      </div>
      <div className="flex w-full justify-center text-slate-400 font-semibold">
        <span>Nr: M-Y-123</span>
      </div>
      <div
        className={clsx(
          "absolute flex w-full justify-center gap-4 mt-4 transition-all duration-300",
          isEditing ? "-bottom-20 opacity-100" : "-bottom-0 opacity-0"
        )}
      >
        <button className="bg-emerald-400 rounded-xl p-2">Abbrechen</button>
        <button className="bg-emerald-400 rounded-xl p-2">Speichern</button>
      </div>
    </div>
  );
};
