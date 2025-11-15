"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { saveAndFinishAction, type OnboardingState } from "../actions";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AvatarUpload from "./AvatarUpload";

type Role = "athlete" | "motionExpert" | "studioHost" | "admin";

type Props = {
  role?: Role;
  defaultValues: { name: string; alias: string; avatar_url?: string };
  uid: string;
  children?: React.ReactNode; // role-specific fields injected by page.tsx
};

export default function OnboardingForm({
  role = "athlete",
  defaultValues,
  uid,
  children,
}: Props) {
  // Action wrapper with error handling
  const submitReducer = async (
    _state: OnboardingState,
    formData: FormData
  ): Promise<OnboardingState> => {
    try {
      await saveAndFinishAction(formData);
      return { ok: true, error: "" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unbekannter Fehler";
      return { ok: false, error: msg };
    }
  };

  const [state, formAction] = useActionState<OnboardingState, FormData>(
    submitReducer,
    { ok: false, error: "" }
  );

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    defaultValues.avatar_url
  );
  const multiStep = role === "athlete"; // only athlete gets the 2-step flow
  const [step, setStep] = useState<number>(multiStep ? 1 : 2);

  const stepsTotal = multiStep ? 2 : 1;
  const progress = useMemo(
    () => (multiStep ? step / stepsTotal : 1),
    [multiStep, step]
  );

  return (
    <form
      action={formAction}
      className="relative rounded-2xl border bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="uid" value={uid} />
      <input type="hidden" name="avatar_url" value={avatarUrl || ""} />
      {/* Progress bar (subtle) */}
      <div className="mb-4 h-1 w-full rounded bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full bg-yuvi-skyblue"
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
      {/* Steps */}
      <div className="min-h-[320px]">
        <AnimatePresence mode="wait" initial={false}>
          {(!multiStep || step === 1) && (
            <motion.div
              key="step-1"
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold">Dein Profil</h2>

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
                {/* <input
                  type="hidden"
                  name="avatar_url"
                  value={avatarUrl || ""}
                /> */}
                <p className="text-xs text-slate-500">
                  Tipp: Quadratisches Bild für bestes Ergebnis.
                </p>
              </div>
            </motion.div>
          )}

          {(!multiStep || step === 2) && (
            <motion.div
              key="step-2"
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold">
                {role === "athlete" ? "Deine Training-Infos" : "Details"}
              </h2>
              {/* role-specific fields injected */}
              {children}
              {state?.error ? (
                <p className="text-sm text-red-600">{state.error}</p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Sticky bottom actions (safe-area aware) */}
      <div className="sticky bottom-0 left-0 right-0 -mx-5 -mb-5 mt-6 bg-white/90 backdrop-blur border-t">
        <div className="px-5 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] flex items-center gap-3">
          {multiStep && step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-md px-4 py-2 text-sm border hover:bg-slate-50"
            >
              Zurück
            </button>
          )}

          {multiStep && step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-white text-sm active:translate-y-px"
            >
              Weiter
            </button>
          ) : (
            <SubmitButton className="flex-1" />
          )}
        </div>
      </div>
      <PendingOverlay text="Speichere dein Profil…" />
    </form>
  );
}

function SubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  const label = pending ? "Speichern…" : "Speichern & weiter";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md bg-yuvi-skyblue hover:bg-yuvi-skyblue-dark font-fancy tracking-widest px-4 py-2 font-semibold text-white disabled:opacity-60 active:translate-y-px ${
        className ?? ""
      }`}
      aria-busy={pending}
    >
      {label.toUpperCase()}
    </button>
  );
}

function PendingOverlay({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="flex items-center gap-3 text-sm text-yuvi-skyblue">
            <svg
              className="animate-spin"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              role="status"
              aria-label="Lädt"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
