"use client";
import { useEffect, useState } from "react";

export default function LiveCountdown({
  startIso,
  className,
}: {
  startIso: string;
  className?: string;
}) {
  const [text, setText] = useState("lädt Countdown…");

  useEffect(() => {
    if (!startIso) return;
    const start = new Date(startIso).getTime();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    const tick = () => {
      const now = Date.now();
      const d = Math.max(0, Math.floor((start - now) / 1000));
      if (d <= 0) {
        setText("Startet jetzt");
        return;
      }
      const days = Math.floor(d / 86400);
      const hrs = Math.floor((d % 86400) / 3600);
      const mins = Math.floor((d % 3600) / 60);
      const secs = d % 60;
      setText(
        days > 0
          ? `Kurs Start in ${days}d ${pad(hrs)}:${pad(mins)}:${pad(secs)}`
          : `Kurs Start in ${pad(hrs)}:${pad(mins)}:${pad(secs)}`
      );
    };

    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [startIso]);

  return <span className={className}>{text}</span>;
}
