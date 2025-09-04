"use client";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { superbase } from "@/utils/supabase/superbaseClient";
import { useEffect, useState } from "react";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error, data } = await superbase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL + "/userdashboard",
      },
    });

    if (error) {
      console.error("Login error:", error);
    } else {
      return redirect(data.url);
    }
  };

  const handleEmailLogin = async () => {
    const { error } = await superbase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Login error:", error);
    } else {
      return redirect("/userdashboard");
    }
  };

  useEffect(() => {
    console.log(email);
    console.log(password);
  }, [email, password]);

  return (
    <div className="flex flex-col justify-center items-center gap-12 pt-6 pb-12 px-8 h-fit w-[500px] rounded-2xl shadow-xl bg-white">
      <div className="flex flex-col gap-2 justify-center items-center">
        <Image
          src="/yuvi-favicon.avif"
          alt="Logo"
          width={48}
          height={48}
          className="rounded-full"
        />
        <h1 className="text-indigo-400 text-3xl font-bold">
          Let&#39;s get you movin
        </h1>
        <p className="text-indigo-300">Bitte melde dich an, um fortzufahren</p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <input
          type="text"
          placeholder="Email oder Benutzername"
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-2xl p-3 w-full text-center text-indigo-400 placeholder:text-gray-300 focus:outline-indigo-400"
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-2xl p-3 w-full text-center text-indigo-400 placeholder:text-gray-300 focus:outline-indigo-400"
          required
        />

        <button
          className={`border rounded-2xl p-3 w-full text-center text-white bg-indigo-400 hover:bg-indigo-500 font-bold cursor-pointer ${
            email && password ? "" : "opacity-50 cursor-not-allowed"
          }`}
          disabled={!email || !password}
          onClick={handleEmailLogin}
        >
          Anmelden
        </button>
        <button className="text-indigo-400 underline">
          Passwort vergessen?
        </button>
      </div>
      <div className="flex w-full items-center text-gray-400 gap-2">
        <hr className="text-gray-300 w-full" />
        <span>or</span>
        <hr className="text-gray-300 w-full" />
      </div>
      <button
        onClick={handleLogin}
        className="flex justify-center items-center gap-2 m-t-96 text-xl bg-blue-600 rounded-2xl px-4 py-2  hover:bg-blue-300 text-white cursor-pointer w-full"
      >
        <div>
          <Image
            src="/Google__G__logo.svg.webp"
            alt="Google Logo"
            width={24}
            height={24}
          />
        </div>
        Login mit Google
      </button>
      <div className="flex flex-col justify-center items-center gap-2 text-gray-400">
        <span>Du bist noch nicht Registriert?</span>
        <Link
          href={
            "mailto:info@yuvi.com?subject=Account Anfrage&body=Hi Yuvi ich [Dein Name] möchte gerne einen Account bei euch anlegen!"
          }
          className="underline text-indigo-400"
        >
          Jetzt registrieren
        </Link>
      </div>
    </div>
  );
};
