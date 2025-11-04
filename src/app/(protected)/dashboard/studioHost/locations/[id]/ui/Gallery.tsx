"use client";

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

export default function Gallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const safe = images?.length ? images : [];
  const current = safe[idx] ?? "";

  return (
    <div className="bg-black/5">
      {/* Hero */}
      <div className="relative aspect-[16/9] w-full bg-slate-200">
        {current ? (
          <Image
            src={current}
            alt="Location"
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-500">
            Kein Bild vorhanden
          </div>
        )}

        {/* Prev/Next (nur bei >1 Bild) */}
        {safe.length > 1 && (
          <>
            <NavBtn
              side="left"
              onClick={() => setIdx((i) => (i - 1 + safe.length) % safe.length)}
            />
            <NavBtn
              side="right"
              onClick={() => setIdx((i) => (i + 1) % safe.length)}
            />
          </>
        )}
      </div>

      {/* Thumbs */}
      {safe.length > 1 && (
        <div className="grid grid-cols-4 gap-1 bg-white p-2 sm:grid-cols-6 md:grid-cols-8">
          {safe.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIdx(i)}
              className={clsx(
                "relative aspect-[4/3] overflow-hidden rounded-md ring-1 ring-inset ring-black/5",
                i === idx && "ring-2 ring-black"
              )}
              title={`Bild ${i + 1}`}
            >
              <Image
                src={src}
                alt={`Thumb ${i + 1}`}
                fill
                sizes="160px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavBtn({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Vorheriges Bild" : "Nächstes Bild"}
      className={clsx(
        "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
