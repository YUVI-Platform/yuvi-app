"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (text: string) => void;
};

export default function QRScannerOverlay({
  open,
  onOpenChange,
  onDetected,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    // ❗️Ref einmal "einfrieren", damit Cleanup nicht mit geändertem Ref arbeitet
    const videoEl = videoRef.current;
    let mounted = true;
    let localControls: IScannerControls | null = null;

    async function start() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const backCam =
          devices.find((d) => /back|rear|environment/i.test(d.label)) ??
          devices[0];

        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(
          backCam?.deviceId ?? undefined,
          videoEl!, // <-- gefrorenes Element
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
      } catch (e: unknown) {
        if (mounted) {
          if (e instanceof Error) {
            setErr(e.message ?? "Kamera-Zugriff fehlgeschlagen.");
          } else {
            setErr(String(e) || "Kamera-Zugriff fehlgeschlagen.");
          }
        }
      }
    }

    if (open && videoEl) start();

    return () => {
      mounted = false;

      // ZXing stoppen
      (localControls ?? controlsRef.current)?.stop();

      // Tracks vom exakt diesem Video-Element stoppen
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
      // @ts-expect-error torch ist experimentell
      await track.applyConstraints({ advanced: [{ torch: true }] });
    } catch {
      setErr("Blitz wird auf diesem Gerät/Browser nicht unterstützt.");
      setTimeout(() => setErr(""), 2500);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 w-[100vw] h-[100vh] max-w-none bg-black">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
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
