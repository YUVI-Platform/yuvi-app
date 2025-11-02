"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Props = {
  initialUrl?: string;
  onUploaded: (publicUrl: string) => void;
};

export default function AvatarUpload({ initialUrl, onUploaded }: Props) {
  const [preview, setPreview] = useState<string | undefined>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic Checks
    const okType = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/avif",
    ].includes(file.type);
    if (!okType) {
      alert("Bitte PNG, JPG, WEBP oder AVIF wählen.");
      e.currentTarget.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Max. 5 MB.");
      e.currentTarget.value = "";
      return;
    }

    setUploading(true);
    const supabase = supabaseBrowser();

    // User holen für Pfad
    const { data: me } = await supabase.auth.getUser();
    const uid = me.user?.id;
    if (!uid) {
      setUploading(false);
      alert("Nicht eingeloggt.");
      return;
    }

    // Pfad: <uid>/avatar-<timestamp>.<ext>
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${uid}/avatar-${Date.now()}.${ext}`;

    // Upload (upsert erlaubt Ersetzen)
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type,
      });

    if (upErr) {
      setUploading(false);
      alert(upErr.message);
      return;
    }

    // Public URL holen
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    // Preview & Callback
    setPreview(publicUrl);
    onUploaded(publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-16 overflow-hidden rounded-full bg-slate-100">
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-slate-400">
            kein Bild
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md bg-slate-900 px-3 py-2 text-white disabled:opacity-60"
        >
          {uploading ? "Lädt…" : "Bild wählen"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={handleSelect}
        />
      </div>
    </div>
  );
}
