// src/app/dashboard/studiohost/locations/[id]/edit/ui/ImageMultiUploadEdit.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Props = {
  name: string;
  bucket: string;
  pathPrefix?: string;
  label?: string;
  initialUrls?: string[]; // vorhandene Bilder
};

type UploadItem =
  | { kind: "existing"; url: string }
  | {
      kind: "new";
      file: File;
      preview: string;
      url?: string;
      status: "pending" | "uploading" | "done" | "error";
      error?: string;
    };

export default function ImageMultiUploadEdit({
  name,
  bucket,
  pathPrefix = "uploads",
  label = "Bilder",
  initialUrls = [],
}: Props) {
  const [items, setItems] = useState<UploadItem[]>(() =>
    initialUrls.map((u) => ({ kind: "existing", url: u }))
  );
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data } = await sb.auth.getUser();
      setUid(data.user?.id ?? null);
    })();
  }, []);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const mapped: UploadItem[] = files.map((f) => ({
      kind: "new",
      file: f,
      preview: URL.createObjectURL(f),
      status: "pending",
    }));
    setItems((prev) => [...prev, ...mapped]);
  }

  async function uploadAll() {
    const sb = supabaseBrowser();
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === "existing") continue;
      if (it.status === "done" || it.status === "uploading") continue;

      setItems((prev) =>
        prev.map((p, idx) =>
          idx === i && p.kind === "new" ? { ...p, status: "uploading" } : p
        )
      );
      const key = `${pathPrefix}/${uid ?? "anon"}/${Date.now()}-${i}-${sanitize(
        it.file.name
      )}`;

      const { data, error } = await sb.storage
        .from(bucket)
        .upload(key, it.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: it.file.type,
        });

      if (error || !data) {
        setItems((prev) =>
          prev.map((p, idx) =>
            idx === i && p.kind === "new"
              ? {
                  ...p,
                  status: "error",
                  error: error?.message || "Upload fehlgeschlagen",
                }
              : p
          )
        );
        continue;
      }

      const { data: pub } = sb.storage.from(bucket).getPublicUrl(data.path);
      setItems((prev) =>
        prev.map((p, idx) =>
          idx === i && p.kind === "new"
            ? { ...p, status: "done", url: pub.publicUrl }
            : p
        )
      );
    }
  }

  function removeAt(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const urls = items
    .map((it) => (it.kind === "existing" ? it.url : it.url))
    .filter((u): u is string => !!u);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:bg-white file:border-slate-300 file:hover:bg-slate-50"
        />
        <button
          type="button"
          onClick={uploadAll}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          disabled={
            !items.some((i) => i.kind === "new" && i.status === "pending")
          }
        >
          Upload starten
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
        {items.map((it, idx) => (
          <div key={idx} className="relative rounded-lg border overflow-hidden">
            <Image
              src={it.kind === "existing" ? it.url : it.url || it.preview}
              alt={`${idx}`}
              width={300}
              height={300}
              className="h-28 w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
              {it.kind === "existing"
                ? "vorhanden"
                : it.status === "pending"
                ? "bereit"
                : it.status === "uploading"
                ? "lädt…"
                : it.status === "done"
                ? "fertig"
                : "Fehler"}
            </div>
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1 right-1 rounded-full bg-white/90 px-2 text-xs"
              title="Entfernen"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* hidden JSON mit allen (bestehenden + neuen) URLs */}
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
    </div>
  );
}

function sanitize(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}
