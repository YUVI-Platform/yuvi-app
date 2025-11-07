// src/components/qr/QR.tsx
"use client";

import { useEffect, useRef } from "react";

type Props = { value: string; size?: number; margin?: number };

export function QR({ value, size = 280, margin = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const node = canvasRef.current; // lokale Kopie, vermeidet Cleanup-Warnungen

    (async () => {
      const mod: any = await import("qrcode");
      const toCanvas = mod?.toCanvas ?? mod?.default?.toCanvas;
      if (!toCanvas || cancelled || !node) return;
      await toCanvas(node, value, { width: size, margin });
    })();

    return () => {
      cancelled = true;
    };
  }, [value, size, margin]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-label="QR code"
      role="img"
      className="rounded-lg shadow"
    />
  );
}
