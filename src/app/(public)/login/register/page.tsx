"use client";
// import Image from "next/image";
import React from "react";
// import { superbase } from "@/utils/supabase/superbaseClient";
// import { ChevronDown, ChevronUp } from "feather-icons-react";
export default function RegisterPage() {
  const [type, setType] = React.useState<
    "motionExpert" | "studioHost" | "athlete"
  >("motionExpert");
  const [userId, setUserId] = React.useState<string>("");
  const [userName, setUserName] = React.useState<string>("");
  // const [userBio, setUserBio] = React.useState<string>("");
  // const [userSkills, setUserSkills] = React.useState<string[]>([]);
  // const [userQualifications, setUserQualifications] = React.useState<string[]>(
  //   []
  // );
  // const [openSkillsDropdown, setOpenSkillsDropdown] = React.useState(false);
  // const [openQualificationsDropdown, setOpenQualificationsDropdown] =
  //   React.useState(false);

  const typeOptions = ["motionExpert", "studioHost", "athlete", "admin"];

  // const skills = [
  //   "Yoga",
  //   "Pilates",
  //   "Cardio",
  //   "Strength Training",
  //   "Dance",
  //   "Martial Arts",
  //   "Cycling",
  //   "Running",
  //   "Swimming",
  //   "CrossFit",
  //   "HIIT (High-Intensity Interval Training)",
  //   "Functional Training",
  //   "Flexibility & Mobility",
  //   "Mindfulness & Meditation",
  //   "Nutrition Coaching",
  // ];

  // const qualifications = [
  //   "Certified Personal Trainer",
  //   "Yoga Instructor Certification",
  //   "Pilates Instructor Certification",
  //   "Group Fitness Instructor Certification",
  //   "Strength and Conditioning Specialist",
  //   "Nutrition Specialist",
  //   "First Aid and CPR Certification",
  //   "Specialized Training Certifications (e.g., TRX, Kettlebell, etc.)",
  //   "Experience with Rehabilitation Exercises",
  //   "Sports-Specific Training Certifications",
  // ];

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
      <div className="flex flex-col gap-4 w-[600px] p-6 bg-white rounded-2xl shadow-lg">
        Register Page – Add User Role (Admin Only)
        <div>
          <h2>Select Type </h2>
          <div>
            {typeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setType(option as "motionExpert" | "studioHost" | "athlete");
                }}
                className={`m-1 px-3 py-1 rounded-full border cursor-pointer ${
                  type === option
                    ? "bg-indigo-400 text-white border-indigo-400"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <input
          type="text"
          placeholder="Alias / User Name"
          onChange={(e) => setUserName(e.target.value)}
          className="border border-indigo-100 rounded-md p-2 w-full bg-white"
        />
        <input
          type="text"
          placeholder="User ID"
          onChange={(e) => setUserId(e.target.value)}
          className="border border-indigo-100 rounded-md p-2 w-full bg-white"
        />
        {/* <textarea
          placeholder="Bio"
          onChange={(e) => setUserBio(e.target.value)}
          className="border border-indigo-100 rounded-md p-2 w-full bg-white"
          rows={5}
        /> */}
        {/* {}
        {type === "motionExpert" && (
          <>
            <div
              onClick={() => setOpenSkillsDropdown(!openSkillsDropdown)}
              className="cursor-pointer border border-indigo-100 rounded-md p-2 w-full bg-white"
            >
              <h2 className="flex justify-between items-center">
                Select Skills{" "}
                {openSkillsDropdown ? <ChevronUp /> : <ChevronDown />}
              </h2>
              <div className={openSkillsDropdown ? "" : "hidden"}>
                {skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      if (userSkills.includes(skill)) {
                        setUserSkills(userSkills.filter((s) => s !== skill));
                      } else {
                        setUserSkills([...userSkills, skill]);
                      }
                    }}
                    className={`m-1 px-3 py-1 rounded-full border ${
                      userSkills.includes(skill)
                        ? "bg-indigo-400 text-white border-indigo-400"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div
              onClick={() =>
                setOpenQualificationsDropdown(!openQualificationsDropdown)
              }
              className="cursor-pointer border border-indigo-100 rounded-md p-2 w-full bg-white"
            >
              <h2 className="flex justify-between items-center">
                Select Qualifications{" "}
                {openQualificationsDropdown ? <ChevronUp /> : <ChevronDown />}
              </h2>
              <div className={openQualificationsDropdown ? "" : "hidden"}>
                {qualifications.map((qualification) => (
                  <button
                    key={qualification}
                    type="button"
                    onClick={() => {
                      if (userQualifications.includes(qualification)) {
                        setUserQualifications(
                          userQualifications.filter((q) => q !== qualification)
                        );
                      } else {
                        setUserQualifications([
                          ...userQualifications,
                          qualification,
                        ]);
                      }
                    }}
                    className={`m-1 px-3 py-1 rounded-full border ${
                      userQualifications.includes(qualification)
                        ? "bg-indigo-400 text-white border-indigo-400"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {qualification}
                  </button>
                ))}
              </div>
            </div>
          </>
        )} */}
        <button
          onClick={async () => {
            if (!userId) {
              alert("Please enter a User ID");
              return;
            }
            await setUserRoleAsAdmin(userId, type);
          }}
          className="flex p-2 bg-indigo-400 rounded-2xl text-white font-bold text-center justify-center hover:bg-indigo-500 transition-colors"
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
