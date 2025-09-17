"use client";
import Image from "next/image";
import React from "react";
import { superbase } from "@/utils/supabase/superbaseClient";
export default function RegisterPage() {
  const [type, setType] = React.useState<
    "motionExpert" | "studioHost" | "athlete"
  >("motionExpert");
  const [userId, setUserId] = React.useState<string>("");
  const [userName, setUserName] = React.useState<string>("");

  const setUserRoleAsAdmin = async (
    userId: string,
    role: "motionExpert" | "studioHost" | "athlete"
  ) => {
    console.log(
      "Setting role",
      role,
      "for user ID:",
      userId,
      "with name:",
      userName
    );
    const res = await fetch("/api/update-user-role", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, role, userName }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("Fehler beim Aktualisieren:", result.error);
    } else {
      console.log("Erfolgreich aktualisiert:", result.data);
    }
  };
  return (
    <main className="w-screen h-screen max-h-screen max-w-screen flex justify-center items-center bg-indigo-200 p-4">
      {/* <form
        action=""
        className="flex flex-col justify-center items-center pt-6 pb-12 px-8 h-fit w-[500px] rounded-2xl shadow-xl bg-white"
      >
        <Image
          src="/yuvi-favicon.avif"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full overflow-hidden"
        />
        <h1 className="text-2xl font-bold">Ready to Move?</h1>
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="name">Name*</label>
            <input
              id="name"
              name="name"
              required
              type="text"
              placeholder="name"
              className="border border-indigo-100 rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="email">Email*</label>
            <input
              id="email"
              name="email"
              required
              type="email"
              placeholder="email"
              className="border border-indigo-100 rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="password">Passwort*</label>
            <input
              id="password"
              name="password"
              required
              type="password"
              placeholder="password"
              className="border border-indigo-100 rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label htmlFor="passwordRepeat">Passwort wiederholen*</label>
            <input
              id="passwordRepeat"
              name="passwordRepeat"
              required
              type="password"
              placeholder="password wiederholen"
              className="border border-indigo-100 rounded-md p-2 w-full"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 bg-indigo-400 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors w-full"
        >
          Register
        </button>
      </form> */}
      <div className="flex flex-col gap-4 w-[400px] p-6 bg-white rounded-2xl shadow-lg">
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => setUserName(e.target.value)}
          className="border border-indigo-100 rounded-md p-2 w-full bg-white"
        />
        <input
          type="text"
          placeholder="User ID"
          onChange={(e) => setUserId(e.target.value)}
          className="border border-indigo-100 rounded-md p-2 w-full bg-white"
        />
        <div className="flex gap-4">
          <button
            onClick={() => setType("athlete")}
            className="flex p-2 bg-green-400 rounded-2xl text-white font-bold"
          >
            Athlete
          </button>
          <button
            onClick={() => setType("motionExpert")}
            className="flex p-2 bg-blue-400 rounded-2xl text-white font-bold"
          >
            Motion Expert
          </button>
          <button
            onClick={() => setType("studioHost")}
            className="flex p-2 bg-orange-400 rounded-2xl text-white font-bold"
          >
            Studio Host
          </button>
        </div>
        <button
          onClick={async () => {
            if (!userId) {
              alert("Please enter a User ID");
              return;
            }
            await setUserRoleAsAdmin(userId, type);
          }}
          className="flex p-2 bg-indigo-400 rounded-2xl text-white font-bold"
        >
          Add as{" "}
          {type === "athlete"
            ? "Athlete"
            : type === "motionExpert"
            ? "Motion Expert"
            : "Studio Host"}
        </button>
      </div>
    </main>
  );
}
