// src/app/(public)/login/ui/LoginClient.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const sp = useSearchParams();
  const error = sp.get("error") ?? "";
  const redirectTo = sp.get("redirectTo") ?? "/dashboard";

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form
        action="/auth/signin/password"
        method="POST"
        className="space-y-3 rounded-xl border bg-white p-5"
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div className="space-y-1">
          <label className="text-sm font-medium">E-Mail</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border px-3 py-2"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Passwort</label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-md border px-3 py-2"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-yuvi-skyblue border px-4 py-2 text-white hover:bg-yuvi-skyblue-dark cursor-pointer font-fancy"
        >
          GET MOVIN
        </button>
      </form>
    </>
  );
}
