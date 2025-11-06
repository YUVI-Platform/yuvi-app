"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";

export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        "text-sm disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
    >
      {pending ? pendingText : children}
    </button>
  );
}
