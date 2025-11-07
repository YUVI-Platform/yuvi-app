// src/app/(protected)/dashboard/motionexpert/occ/[id]/checkin/ui/QR.tsx
"use client";

import { useEffect, useRef } from "react";

type Props = { value: string; size?: number; margin?: number };

export function QR({ value, size = 240, margin = 0 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Dynamisch laden, damit wir sowohl CJS als auch ESM abdecken
      const mod: any = await import("qrcode");
      const toCanvas = mod?.toCanvas ?? mod?.default?.toCanvas; // Fallback
      if (!toCanvas || cancelled || !ref.current) return;
      await toCanvas(ref.current, value, { width: size, margin });
    })();
    return () => {
      cancelled = true;
    };
  }, [value, size, margin]);

  return <canvas ref={ref} aria-label="QR code" role="img" />;
}
