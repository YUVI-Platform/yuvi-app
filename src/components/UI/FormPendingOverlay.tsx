"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "./Spinner";

export function FormPendingOverlay({
  text = "Bitte einen Moment…",
}: {
  text?: string;
}) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-sm">
        <Spinner />
        <span>{text}</span>
      </div>
    </div>
  );
}
