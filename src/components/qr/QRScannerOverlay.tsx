// src/components/qr/QRScannerOverlay.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type BarcodeDetectorStatic = {
  new (opts?: { formats?: string[] }): {
    detect: (
      src: CanvasImageSource | HTMLVideoElement | ImageBitmap | HTMLImageElement
    ) => Promise<Array<{ rawValue: string }>>;
  };
  getSupportedFormats?: () => Promise<string[]>;
};

async function supportsNativeQR(): Promise<boolean> {
  const BD = (globalThis as any).BarcodeDetector as
    | BarcodeDetectorStatic
    | undefined;
  if (!BD) return false;
  try {
    const formats = await BD.getSupportedFormats?.();
    return !!formats?.includes("qr_code");
  } catch {
    return false;
  }
}

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
    const videoEl = videoRef.current;
    let mounted = true;
    let localControls: import("@zxing/browser").IScannerControls | null = null;
    let stopStream: (() => void) | null = null;

    async function start() {
      if (!videoEl) return;

      try {
        // 1) HTTPS/localhost requirement
        if (!window.isSecureContext && location.hostname !== "localhost") {
          setErr(
            "Kamera erfordert HTTPS oder localhost. Nutze z. B. ngrok/Cloudflare Tunnel."
          );
          return;
        }

        // 2) Erst versuchen wir den nativen BarcodeDetector (wenn verfügbar & unterstützt)
        if (await supportsNativeQR()) {
          // MediaStream öffnen
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
          videoEl.srcObject = stream;
          await videoEl.play();

          const BD = (globalThis as any)
            .BarcodeDetector as BarcodeDetectorStatic;
          const detector = new BD({ formats: ["qr_code"] });

          let raf = 0;
          const tick = async () => {
            if (!mounted) return;
            try {
              // Einfache Taktung (ca. ~10 fps), um CPU zu schonen
              await new Promise((r) => setTimeout(r, 100));
              // Frame detektieren
              const results = await detector.detect(videoEl);
              const match = results?.[0]?.rawValue;
              if (match) {
                closeAll();
                onDetected(match);
                return;
              }
            } catch {
              // still silently continue
            }
            raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);

          stopStream = () => {
            cancelAnimationFrame(raf);
            const stream = videoEl.srcObject as MediaStream | null;
            stream?.getTracks().forEach((t) => t.stop());
            videoEl.srcObject = null;
          };

          return;
        }

        // 3) Fallback: ZXing Scanner
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          constraints,
          videoEl,
          (result, _err, ctrls) => {
            if (ctrls) localControls = ctrls;
            if (result && mounted) {
              (localControls ?? controlsRef.current)?.stop();
              closeAll();
              onDetected(result.getText());
            }
          }
        );

        localControls = controls;
        controlsRef.current = controls;

        // sauberes Stoppen für den Fallback
        stopStream = () => {
          (localControls ?? controlsRef.current)?.stop();
          const stream = videoEl.srcObject as MediaStream | null;
          stream?.getTracks().forEach((t) => t.stop());
          videoEl.srcObject = null;
        };
      } catch (e: any) {
        const msg =
          e?.name === "NotAllowedError"
            ? "Kamerazugriff verweigert. Bitte Berechtigung erteilen."
            : e?.name === "NotFoundError"
            ? "Keine Kamera gefunden."
            : e?.message || "Kamera-Zugriff fehlgeschlagen.";
        setErr(msg);
      }

      function closeAll() {
        onOpenChange(false);
        if (stopStream) stopStream();
      }
    }

    if (open && videoEl) start();

    return () => {
      mounted = false;
      // ZXing Controls stoppen
      (localControls ?? controlsRef.current)?.stop?.();
      // MediaStream beenden
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
      // Torch ist nicht standard-typisiert → über any casten
      await (track as any).applyConstraints?.({
        advanced: [{ torch: true }],
      });
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
