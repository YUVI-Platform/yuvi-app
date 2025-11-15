// src/app/(protected)/dashboard/motionexpert/occ/[id]/SessionImagesEditor.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseBrowser";
import { X, UploadCloud, Trash2 } from "lucide-react";

// Server Action als Prop (FormAction), wird in page.tsx übergeben
type PersistAction = (formData: FormData) => Promise<any>;

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_SESSIONS || "sessions";

type Props = {
  sessionId: string;
  initialKeys: string[]; // z.B. ["public/sessions/<sessionId>/file.jpg"] oder bereits absolute URLs
  persistAction: PersistAction; // expects fields: session_id, images_json
  className?: string;
};

type Item = {
  key: string; // DB-Schlüssel z.B. "public/sessions/<id>/name.jpg" ODER absolute URL
  publicUrl: string; // absolute URL zum Anzeigen
};

export default function SessionImagesEditor({
  sessionId,
  initialKeys,
  persistAction,
  className,
}: Props) {
  const [items, setItems] = React.useState<Item[]>([]);
  const [busy, setBusy] = React.useState(false);
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  React.useEffect(() => {
    // initialKeys → public URLs auflösen (wenn nötig)
    (async () => {
      const out: Item[] = [];
      for (const k of initialKeys) {
        if (/^https?:\/\//i.test(k)) {
          out.push({ key: k, publicUrl: k });
          continue;
        }
        // unterstützt "public/<bucket>/<key>" und "/storage/v1/object/public/…"
        const m = k.match(/^public\/([^/]+)\/(.+)$/);
        if (m) {
          const [, bucket, key] = m;
          const { data } = supabase.storage.from(bucket).getPublicUrl(key);
          out.push({ key: k, publicUrl: data.publicUrl });
          continue;
        }
        if (
          k.startsWith("/storage/v1/object/") ||
          k.startsWith("storage/v1/object/")
        ) {
          out.push({
            key: k,
            publicUrl: k.startsWith("/") ? `${supaUrl}${k}` : `${supaUrl}/${k}`,
          });
          continue;
        }
        // Fallback: behandeln als "<bucket>/<key>"
        const firstSlash = k.indexOf("/");
        const bucket = firstSlash > 0 ? k.slice(0, firstSlash) : BUCKET;
        const key = firstSlash > 0 ? k.slice(firstSlash + 1) : k;
        const { data } = supabase.storage.from(bucket).getPublicUrl(key);
        out.push({ key: `public/${bucket}/${key}`, publicUrl: data.publicUrl });
      }
      setItems(out);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKeys.join("|")]);

  async function onFilesSelected(files: FileList | null) {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const newItems: Item[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
        const path = `sessions/${sessionId}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            upsert: false,
            contentType: file.type,
            cacheControl: "3600",
          });
        if (error) throw error;

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        // Wir speichern in der DB eine portable Form:
        // "public/<bucket>/<key>" → lässt sich überall robust auflösen
        newItems.push({
          key: `public/${BUCKET}/${path}`,
          publicUrl: data.publicUrl,
        });
      }
      setItems((prev) => [...prev, ...newItems]);
    } finally {
      setBusy(false);
    }
  }

  async function removeAt(i: number) {
    const item = items[i];
    setItems((prev) => prev.filter((_, idx) => idx !== i));

    // Optional: Datei auch in Storage löschen, wenn sie aus *unserem* Bucket stammt
    const m = item.key.match(/^public\/([^/]+)\/(.+)$/);
    if (m) {
      const [, bucket, key] = m;
      // nur löschen, wenn unser definierter Bucket → vermeidet versehentliche Fremd-Deletes
      if (bucket === BUCKET) {
        await supabase.storage.from(bucket).remove([key]);
      }
    }
  }

  // Submit an Server Action (persistAction)
  async function persist() {
    const fd = new FormData();
    fd.append("session_id", sessionId);
    fd.append(
      "images_json",
      JSON.stringify(items.map((it) => it.key)) // genau diese Keys kommen in die DB
    );
    await persistAction(fd);
  }

  return (
    <div className={className}>
      <div className="mb-2 text-sm text-slate-700">Bilder</div>

      {/* Grid Preview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((it, i) => (
          <div
            key={it.key + i}
            className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-white"
          >
            <Image src={it.publicUrl} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-2 right-2 rounded-md bg-white/80 p-1 hover:bg-white"
              aria-label="Bild entfernen"
              title="Bild entfernen"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* Upload Tile */}
        <label className="relative aspect-[16/9] cursor-pointer rounded-lg border-dashed border-2 border-slate-300 flex items-center justify-center hover:bg-slate-50">
          <input
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => onFilesSelected(e.currentTarget.files)}
          />
          <div className="flex flex-col items-center text-xs text-slate-600">
            <UploadCloud className="mb-1" />
            {busy ? "Lade hoch…" : "Bilder hochladen"}
          </div>
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={persist}
          className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:opacity-90"
        >
          Speichern
        </button>
        <span className="text-xs text-slate-500">
          Bilder werden erst nach „Speichern“ in der Session gesichert.
        </span>
      </div>
    </div>
  );
}
