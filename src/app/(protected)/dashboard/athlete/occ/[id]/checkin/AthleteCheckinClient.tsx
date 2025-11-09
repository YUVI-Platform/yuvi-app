"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import QRScannerOverlay from "@/components/qr/QRScannerOverlay";
import { athleteCheckinAction } from "./actions";

export default function AthleteCheckinClient({
  occurrenceId,
  initialCode,
}: {
  occurrenceId: string;
  initialCode: string;
}) {
  const router = useRouter();
  const [code, setCode] = React.useState(initialCode ?? "");
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [err, setErr] = React.useState("");
  const [scanOpen, setScanOpen] = React.useState(false);

  // Auto-Check-in wenn ?code=... vorhanden
  React.useEffect(() => {
    if (!initialCode) return;
    (async () => {
      try {
        setLoading(true);
        await athleteCheckinAction(occurrenceId, initialCode);
        setOk(true);
        setErr("");
      } catch (e: any) {
        setOk(false);
        setErr(e?.message ?? "Check-in fehlgeschlagen.");
      } finally {
        setLoading(false);
      }
    })();
  }, [occurrenceId, initialCode]);

  function handleDetected(text: string) {
    // Reset Status für erneuten Versuch
    setOk(null);
    setErr("");

    try {
      const u = new URL(text, window.location.origin);
      const c = u.searchParams.get("code") ?? "";
      if (!c) {
        setErr("Kein Code im QR gefunden.");
        return;
      }
      const parts = u.pathname.split("/");
      const scannedOcc = parts[parts.indexOf("occ") + 1];
      if (scannedOcc && scannedOcc !== occurrenceId) {
        setErr("Falsche Session für diesen Check-in.");
        return;
      }
      setScanOpen(false);
      router.replace(`?code=${encodeURIComponent(c)}`);
      setCode(c);
    } catch {
      // Falls der QR nur den Code enthält (kein URL-Format), akzeptieren:
      const plain = text?.trim();
      if (plain) {
        setScanOpen(false);
        setCode(plain);
        router.replace(`?code=${encodeURIComponent(plain)}`);
      } else {
        setErr("Ungültiger QR-Inhalt.");
      }
    }
  }

  async function submitManual() {
    try {
      if (!code) {
        setErr("Bitte Code eingeben.");
        return;
      }
      setLoading(true);
      setOk(null);
      await athleteCheckinAction(occurrenceId, code);
      setOk(true);
      setErr("");
    } catch (e: any) {
      setOk(false);
      setErr(e?.message ?? "Check-in fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Teilnahme bestätigen</h1>

      {loading && (
        <div className="rounded-md border p-3 text-sm">Check-in läuft…</div>
      )}
      {ok === true && !loading && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Check-in erfolgreich ✅
        </div>
      )}
      {ok === false && !loading && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err || "Check-in fehlgeschlagen."}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Code</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="6–12-stelliger Code"
          value={code}
          onChange={(e) => {
            setOk(null);
            setErr("");
            setCode(e.target.value);
          }}
          inputMode="numeric"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submitManual}
            disabled={loading}
            className="rounded-md bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            Einchecken
          </button>
          <button
            type="button"
            onClick={() => {
              setOk(null);
              setErr("");
              setScanOpen(true);
            }}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            QR scannen
          </button>
        </div>
      </div>

      <QRScannerOverlay
        open={scanOpen}
        onOpenChange={setScanOpen}
        onDetected={handleDetected}
      />
    </div>
  );
}
