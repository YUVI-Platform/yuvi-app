"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveProfile, type OnboardingState } from "../actions";
import { useState } from "react";
import AvatarUpload from "./AvatarUpload";

type Props = {
  defaultValues: { name: string; alias: string; avatar_url?: string };
};

export default function OnboardingForm({ defaultValues }: Props) {
  const [state, formAction] = useFormState<OnboardingState, FormData>(
    saveProfile,
    { ok: false, error: "" }
  );
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    defaultValues.avatar_url
  );

  return (
    <form action={formAction} className="relative space-y-4">
      <PendingOverlay text="Account wird gespeichert…" />

      <div className="space-y-1">
        <label className="text-sm font-medium">Anzeigename</label>
        <input
          name="name"
          defaultValue={defaultValues.name}
          required
          className="w-full rounded-md border px-3 py-2"
          placeholder="z. B. Alex M."
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Alias / Handle</label>
        <input
          name="alias"
          defaultValue={defaultValues.alias}
          required
          className="w-full rounded-md border px-3 py-2"
          placeholder="@alexmoves"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Avatar</label>
        <AvatarUpload
          initialUrl={defaultValues.avatar_url}
          onUploaded={(url) => setAvatarUrl(url)}
        />
        {/* Hidden field: wird in Server Action gespeichert */}
        <input type="hidden" name="avatar_url" value={avatarUrl || ""} />
      </div>

      {state?.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <SubmitButton>Speichern & weiter</SubmitButton>
    </form>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-yuvi-rose px-4 py-2 font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Speichern…" : children}
    </button>
  );
}

function PendingOverlay({ text }: { text: string }) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-sm text-slate-700">
        <svg
          className="animate-spin"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          role="status"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="opacity-25"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
          />
        </svg>
        <span>{text}</span>
      </div>
    </div>
  );
}
