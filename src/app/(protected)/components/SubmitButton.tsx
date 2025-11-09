// app/(protected)/components/SubmitButton.tsx
"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "inline-flex items-center justify-center rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50 cursor-pointer"
      }
    >
      {pending ? "Bitte warten…" : children}
    </button>
  );
}
