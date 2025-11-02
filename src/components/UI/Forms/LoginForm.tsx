"use client";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
// import { Spinner } from "@/components/ui/Spinner";

export const LoginForm = () => {
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const error = sp.get("error") || "";
  const redirectTo = sp.get("redirectTo") || "/admin/invites";

  return (
    <div className="flex flex-col justify-center items-center gap-12 pt-6 pb-12 px-8 h-fit w-[500px] rounded-2xl shadow-xl bg-white">
      <div className="flex flex-col gap-2 justify-center items-center">
        <span className="font-fancy text-5xl text-yuvi-rose">YUVi</span>
        <h1 className="text-black text-3xl font-bold">
          Let&#39;s get you movin
        </h1>
        <p className="text-slate-500">Bitte melde dich an, um fortzufahren</p>
        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>

      {/* E-Mail / Passwort → POST an Server-Route */}
      <form
        action="/auth/signin/password"
        method="post"
        className="flex flex-col gap-4 w-full"
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-2xl p-3 w-full text-center text-indigo-400 placeholder:text-gray-300 focus:outline-indigo-400"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Passwort"
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-2xl p-3 w-full text-center text-indigo-400 placeholder:text-gray-300 focus:outline-indigo-400"
          required
        />

        <SubmitButton
          className="w-full rounded-2xl bg-indigo-400 px-4 py-3 font-bold text-white hover:bg-indigo-500"
          pendingText="Anmeldung läuft…"
        >
          Anmelden
        </SubmitButton>
        <button
          type="button"
          className="text-yuvi-rose underline"
          onClick={() =>
            alert("Schreib mir, ob ich einen Reset-Flow anlegen soll.")
          }
        >
          Passwort vergessen?
        </button>
      </form>

      <div className="flex w-full items-center text-gray-400 gap-2">
        <hr className="text-gray-300 w-full" />
        <span>or</span>
        <hr className="text-gray-300 w-full" />
      </div>

      {/* Google OAuth → GET an /auth/oauth */}
      {/* <a
        href={`/auth/oauth?provider=google&redirectTo=${encodeURIComponent(
          redirectTo
        )}`}
        className="flex justify-center items-center gap-2 text-xl bg-blue-600 rounded-2xl px-4 py-2 hover:bg-blue-500 text-white w-full"
      >
        <Image
          src="/Google__G__logo.svg.webp"
          alt="Google Logo"
          width={24}
          height={24}
        />
        Login mit Google
      </a> */}

      <div className="flex flex-col justify-center items-center gap-2 text-gray-400">
        <span>Du bist noch nicht registriert?</span>
        <Link
          href={
            "mailto:info@yuvi.com?subject=Account Anfrage&body=Hi Yuvi, ich [Dein Name] möchte gerne einen Account anlegen!"
          }
          className="underline text-indigo-400"
        >
          Jetzt registrieren
        </Link>
      </div>
    </div>
  );
};
