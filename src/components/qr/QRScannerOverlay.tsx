// src/components/qr/QRScannerOverlay.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ZXControls = import("@zxing/browser").IScannerControls | null;

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
  const controlsRef = useRef<ZXControls>(null);
  const [err, setErr] = useState("");
  const torchOnRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    let stopped = false;
    let rafId = 0;
    let stream: MediaStream | null = null;
    let localZX: ZXControls = null;

    const stopAll = () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      try {
        (localZX ?? controlsRef.current)?.stop();
      } catch {}
      const v = videoRef.current;
      const ms = (v?.srcObject as MediaStream | null) ?? stream;
      ms?.getTracks().forEach((t) => t.stop());
      if (v) v.srcObject = null;
    };

    const errorMsg = (e: any) => {
      const name = e?.name || "";
      const msg = e?.message || "";
      if (name === "NotAllowedError")
        return "Kamerazugriff verweigert. Bitte Berechtigung erteilen.";
      if (name === "NotFoundError") return "Keine Kamera gefunden.";
      if (msg.includes("Only secure origins are allowed"))
        return "Kamera erfordert HTTPS oder localhost. Nutze z. B. ngrok/CF Tunnel.";
      return msg || "Kamera-Zugriff fehlgeschlagen.";
    };

    async function startWithBarcodeDetector(v: HTMLVideoElement) {
      // 1) UserMedia anfordern
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      v.srcObject = stream;
      await v.play();

      // 2) Prüfen, ob BarcodeDetector QR kann
      // @ts-expect-error: BarcodeDetector ist noch nicht in allen TS DOM Typings sauber enthalten
      if (!("BarcodeDetector" in window)) return false;
      // @ts-expect-error
      const supported = await window.BarcodeDetector.getSupportedFormats?.();
      if (!supported || !supported.includes("qr_code")) return false;
      // @ts-expect-error
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      const tick = async () => {
        if (stopped) return;
        try {
          const codes = await detector.detect(v);
          const first = codes?.[0];
          if (first?.rawValue) {
            stopAll();
            onOpenChange(false);
            onDetected(first.rawValue);
            return;
          }
        } catch {
          // weiter scannen
        }
        rafId = requestAnimationFrame(tick);
      };
      tick();

      return true; // BarcodeDetector aktiv
    }

    async function startWithZXing(v: HTMLVideoElement) {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      localZX = await reader.decodeFromVideoDevice(
        undefined, // auto-pick camera
        v,
        (result, _err, ctrls) => {
          if (ctrls) localZX = ctrls;
          if (!result || stopped) return;
          try {
            stopAll();
          } finally {
            onOpenChange(false);
            onDetected(result.getText());
          }
        }
      );
      controlsRef.current = localZX;
      return true;
    }

    // 👉 wichtig: Auf das Mounten des <video> warten.
    const waitForVideo = () => {
      if (stopped) return;
      if (videoRef.current) {
        (async () => {
          try {
            // bevorzugt BarcodeDetector
            const ok =
              (await startWithBarcodeDetector(videoRef.current!)) ||
              (await startWithZXing(videoRef.current!));
            if (!ok) {
              setErr(
                "Kein Scanner verfügbar. Bitte aktualisiere deinen Browser."
              );
            }
          } catch (e: any) {
            setErr(errorMsg(e));
          }
        })();
      } else {
        rafId = requestAnimationFrame(waitForVideo);
      }
    };

    waitForVideo();

    return () => {
      stopAll();
    };
  }, [open, onDetected, onOpenChange]);

  async function toggleTorch() {
    try {
      const track = (
        videoRef.current?.srcObject as MediaStream | undefined
      )?.getVideoTracks?.()[0];
      if (!track) return;
      const capabilities = (track as any).getCapabilities?.();
      if (!capabilities?.torch) {
        setErr("Blitz wird auf diesem Gerät/Browser nicht unterstützt.");
        setTimeout(() => setErr(""), 2500);
        return;
      }
      torchOnRef.current = !torchOnRef.current;
      await (track as any).applyConstraints({
        advanced: [{ torch: torchOnRef.current }],
      });
    } catch {
      setErr("Blitz konnte nicht geschaltet werden.");
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
          {/* Fokusrahmen */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="w-64 h-64 rounded-xl border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
          </div>

          {/* Controls */}
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              type="button"
              onClick={toggleTorch}
              className="rounded-full bg-white/90 px-3 py-1 text-sm"
            >
              Blitz
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
