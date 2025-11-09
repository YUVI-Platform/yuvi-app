// src/components/qr/QRScannerOverlay.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
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

export type QRScannerHandle = {
  begin: () => void; // imperatives Starten im Click-Handler
};

export type QRScannerOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (text: string) => void;
};

const QRScannerOverlay = forwardRef<QRScannerHandle, QRScannerOverlayProps>(
  ({ open, onOpenChange, onDetected }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<
      import("@zxing/browser").IScannerControls | null
    >(null);
    const [err, setErr] = useState("");
    const mountedRef = useRef(false);

    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    // alles stoppen/aufräumen
    function stopAll() {
      (controlsRef.current as any)?.stop?.();
      const stream = videoRef.current?.srcObject as
        | MediaStream
        | null
        | undefined;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    }

    function closeAll() {
      onOpenChange(false);
      stopAll();
    }

    async function startNow() {
      const videoEl = videoRef.current;
      if (!videoEl || !mountedRef.current) return;

      try {
        if (!window.isSecureContext && location.hostname !== "localhost") {
          setErr(
            "Kamera erfordert HTTPS oder localhost. Öffne die Seite in Safari unter HTTPS."
          );
          return;
        }

        // Versuch 1: Native BarcodeDetector
        if (await supportsNativeQR()) {
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
          const loop = async () => {
            if (!mountedRef.current) return;
            try {
              await new Promise((r) => setTimeout(r, 80));
              const results = await detector.detect(videoEl);
              const value = results?.[0]?.rawValue;
              if (value) {
                closeAll();
                onDetected(value);
                return;
              }
            } catch {
              /* noop */
            }
            raf = requestAnimationFrame(loop);
          };
          raf = requestAnimationFrame(loop);

          // stop handler
          controlsRef.current = {
            stop() {
              cancelAnimationFrame(raf);
              const s = videoEl.srcObject as MediaStream | null;
              s?.getTracks().forEach((t) => t.stop());
              videoEl.srcObject = null;
            },
          } as any;

          return;
        }

        // Versuch 2: ZXing (ruft getUserMedia intern auf)
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          },
          videoEl,
          (result, _err, ctrls) => {
            if (ctrls) controlsRef.current = ctrls;
            if (result && mountedRef.current) {
              (controlsRef.current as any)?.stop?.();
              closeAll();
              onDetected(result.getText());
            }
          }
        );
        controlsRef.current = controls;
      } catch (e: any) {
        const ua = navigator.userAgent || "";
        const inApp = /Instagram|FBAN|FBAV|FB_IAB|Line\/|WeChat/i.test(ua);
        const msg =
          e?.name === "NotAllowedError"
            ? "Kamerazugriff verweigert. Bitte Berechtigung erteilen."
            : e?.name === "NotFoundError"
            ? "Keine Kamera gefunden."
            : inApp
            ? "In-App-Browser blockiert die Kamera. Öffne die Seite im Safari-Browser."
            : e?.message || "Kamera-Zugriff fehlgeschlagen.";
        setErr(msg);
      }
    }

    // Imperative API für den Button-Klick
    useImperativeHandle(ref, () => ({ begin: startNow }), []);

    // Cleanup wenn Overlay schließt/unmountet
    useEffect(() => {
      if (!open) stopAll();
      // kein auto-start im useEffect → Start per ref.begin() im Klick
    }, [open]);

    async function toggleTorch() {
      try {
        const track = (
          videoRef.current?.srcObject as MediaStream | undefined
        )?.getVideoTracks?.()[0];
        if (!track) return;
        await (track as any).applyConstraints?.({
          advanced: [{ torch: true }],
        });
      } catch {
        setErr("Blitz wird auf diesem Gerät/Browser nicht unterstützt.");
        setTimeout(() => setErr(""), 2500);
      }
    }

    return (
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) stopAll();
          onOpenChange(o);
        }}
      >
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
);

QRScannerOverlay.displayName = "QRScannerOverlay";
export default QRScannerOverlay;
