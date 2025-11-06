"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "./Spinner";

export function SubmitButton({
  children,
  pendingText = "Bitte warten…",
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {pending ? (
        <>
          <Spinner />
          <span>{pendingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
