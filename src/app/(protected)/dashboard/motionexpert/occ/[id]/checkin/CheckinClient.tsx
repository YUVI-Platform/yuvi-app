// src/app/(protected)/dashboard/motionexpert/occ/[id]/checkin/CheckinClient.tsx
"use client";

import * as React from "react";
import { QR } from "@/components/qr/QR";

export default function CheckinClient({
  qrUrl,
  token,
  expiresAt,
}: {
  qrUrl: string;
  token: string;
  expiresAt: string;
}) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const exp = new Date(expiresAt).getTime();
  const msLeft = Math.max(0, exp - now);
  const expired = msLeft <= 0;
  const mm = String(Math.floor(msLeft / 60000)).padStart(2, "0");
  const ss = String(Math.floor((msLeft % 60000) / 1000)).padStart(2, "0");

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Check-in QR</h1>
        <p className="text-sm text-slate-600">
          Gültig bis {new Date(expiresAt).toLocaleTimeString()}{" "}
          {!expired && (
            <span>
              ({mm}:{ss})
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border bg-white p-6">
        {/* Lokales Canvas-QR, kein next/image & keine Remote-Domain nötig */}
        <QR value={qrUrl} size={280} />

        <div className="text-center">
          <p className="text-xs text-slate-500">Fallback-Code</p>
          <p className="text-2xl font-mono tracking-widest">{token}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={qrUrl}
            target="_blank"
            className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
          >
            Test-Check-in öffnen
          </a>
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={() => navigator.clipboard.writeText(token)}
          >
            Code kopieren
          </button>
          <a
            href="?refresh=1"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Code neu erzeugen
          </a>
        </div>

        {expired && (
          <div className="w-full rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
            Der Code ist abgelaufen.{" "}
            <a href="?refresh=1" className="underline">
              Jetzt neuen Code erzeugen
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
