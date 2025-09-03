"use client";

import { supabase } from "@/libs/superbase/superbaseClient";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) console.error("Login error:", error);
  };

  return (
    <main className="w-screen h-screen max-h-screen max-w-screen flex justify-center items-center bg-indigo-400">
      <div className="flex flex-col justify-center items-center gap-8 h-48 w-96 rounded-2xl shadow-xl bg-white">
        <h1 className="text-indigo-400 text-4xl gelasio">YUVI</h1>
        <button
          onClick={handleLogin}
          className="flex justify-center items-center gap-2 m-t-96 text-xl border-gray-200 border-2 rounded-2xl px-4 py-2 text-gray-700 hover:bg-blue-300 hover:text-white cursor-pointer"
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
        <Link
          href={
            "mailto:info@yuvi.com?subject=Account Anfrage&body=Hi Yuvi ich [Dein Name] möchte gerne einen Account bei euch anlegen!"
          }
        >
          Account Anfragen
        </Link>
      </div>
    </main>
  );
}
