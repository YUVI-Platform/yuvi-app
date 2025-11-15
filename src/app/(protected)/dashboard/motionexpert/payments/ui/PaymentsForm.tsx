"use client";

import * as React from "react";
import { useActionState } from "react";
import { savePaypalLink } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PaymentsForm({ defaultLink }: { defaultLink: string }) {
  const [state, formAction, pending] = useActionState(savePaypalLink, null);
  const [value, setValue] = React.useState(defaultLink);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">PayPal‑Link</label>
        <Input
          name="paypalLink"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://paypal.me/deinname"
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-slate-500">
          Erlaubt: <code>paypal.me/&lt;name&gt;</code>,{" "}
          <code>paypal.com/paypalme/&lt;name&gt;</code>,{" "}
          <code>paypal.link/...</code>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Speichere…" : "Speichern"}
        </Button>
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 underline"
          >
            Test‑Link öffnen
          </a>
        )}
      </div>

      {state && (
        <p
          className={`text-sm ${
            state.ok ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
