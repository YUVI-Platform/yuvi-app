// src/components/qr/QRScannerOverlay.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function QRScannerOverlay({
  open,
  onOpenChange,
  onDetected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (text: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<import("@zxing/browser").IScannerControls | null>(
    null
  );
  const [err, setErr] = useState("");

  useEffect(() => {
    const videoEl = videoRef.current; // ref „einfrieren“
    let mounted = true;
    let localControls: import("@zxing/browser").IScannerControls | null = null;

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");

        // ⚙️ Nutze Constraints statt Device-ID (besser auf iOS/Android)
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" },
            // optional etwas höher auflösen
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          constraints,
          videoEl!,
          (result, _err, ctrls) => {
            if (ctrls) localControls = ctrls;
            if (result && mounted) {
              (localControls ?? controlsRef.current)?.stop();
              onOpenChange(false);
              onDetected(result.getText());
            }
          }
        );

        localControls = controls;
        controlsRef.current = controls;
      } catch (e: any) {
        const msg =
          e?.name === "NotAllowedError"
            ? "Kamerazugriff verweigert. Bitte Berechtigung erteilen."
            : e?.name === "NotFoundError"
            ? "Keine Kamera gefunden."
            : e?.message?.includes("Only secure origins are allowed")
            ? "Kamera erfordert HTTPS oder localhost. Verwende z. B. ngrok/CF Tunnel."
            : e?.message || "Kamera-Zugriff fehlgeschlagen.";
        setErr(msg);
      }
    }

    if (open && videoEl) start();

    return () => {
      mounted = false;
      (localControls ?? controlsRef.current)?.stop();

      // exakt diesen Stream stoppen
      const stream = videoEl?.srcObject as MediaStream | null | undefined;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoEl) videoEl.srcObject = null;
    };
  }, [open, onDetected, onOpenChange]);

  async function toggleTorch() {
    try {
      const track = (
        videoRef.current?.srcObject as MediaStream | undefined
      )?.getVideoTracks?.()[0];
      if (!track) return;
      // @ts-expect-error - applyConstraints with torch is not typed in lib.dom for all browsers
      await track.applyConstraints({ advanced: [{ torch: true }] });
    } catch {
      setErr("Blitz wird auf diesem Gerät/Browser nicht unterstützt.");
      setTimeout(() => setErr(""), 2500);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 w-[100vw] h-[100vh] max-w-none bg-black">
        <DialogTitle className="sr-only">QR-Scanner</DialogTitle>

        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="w-64 h-64 rounded-xl border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
          </div>

          <div className="absolute top-4 left-4 flex gap-2">
            <button
              type="button"
              onClick={toggleTorch}
              className="rounded-full bg-white/90 px-3 py-1 text-sm"
            >
              Blitz an
            </button>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm"
          >
            Schließen
          </button>

          {err && (
            <div className="absolute bottom-0 left-0 right-0 m-4 rounded-lg bg-white/90 text-red-600 text-sm p-3">
              {err}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
