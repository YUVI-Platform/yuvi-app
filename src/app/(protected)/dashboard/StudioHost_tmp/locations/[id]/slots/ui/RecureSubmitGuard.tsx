"use client";
import { useEffect } from "react";

export function RecurSubmitGuard({ formId }: { formId: string }) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    function onSubmit(e: Event) {
      const until = (
        form!.querySelector(
          'input[name="until_date"]'
        ) as HTMLInputElement | null
      )?.value;
      const count = (
        form!.querySelector('input[name="count"]') as HTMLInputElement | null
      )?.value;
      if (!until && !count) {
        e.preventDefault();
        alert("Bitte Enddatum oder Anzahl angeben.");
      }
    }

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [formId]);

  return null;
}
