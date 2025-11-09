"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Props = {
  name: string; // hidden input name
  bucket: string; // z.B. "studio-images"
  pathPrefix?: string; // z.B. "locations"
  label?: string;
};

type UploadItem = {
  file: File;
  preview: string;
  url?: string; // public url after upload
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

export default function ImageMultiUpload({
  name,
  bucket,
  pathPrefix = "uploads",
  label = "Bilder",
}: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
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
      if (it.status === "done" || it.status === "uploading") continue;

      setItems((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: "uploading" } : p))
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
            idx === i
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
          idx === i ? { ...p, status: "done", url: pub.publicUrl } : p
        )
      );
    }
  }

  function removeAt(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const urls = items
    .filter((i) => i.status === "done" && i.url)
    .map((i) => i.url!);

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
          disabled={!items.some((i) => i.status === "pending")}
        >
          Upload starten
        </button>
      </div>

      {/* Thumbnails */}
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
        {items.map((it, idx) => (
          <div key={idx} className="relative rounded-lg border overflow-hidden">
            <Image
              src={it.url || it.preview}
              alt={`${idx}`}
              width={300}
              height={300}
              className="h-28 w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
              {it.status === "pending" && "bereit"}
              {it.status === "uploading" && "lädt…"}
              {it.status === "done" && "fertig"}
              {it.status === "error" && (it.error || "Fehler")}
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

      {/* Hidden field mit JSON-Array der Public-URLs */}
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
    </div>
  );
}

function sanitize(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}
