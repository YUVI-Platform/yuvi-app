// src/app/(protected)/dashboard/motionexpert/sessions/new/ui/StepSessionDetails.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export type SessionDetails = {
  title: string;
  description?: string;
  duration_min: number;
  capacity: number | null;
  tags: string[];
  price_cents: number | null;
  recommended_level?: string | null;
  image_url: string | null;
};

type Props = {
  defaultValues?: Partial<SessionDetails>;
  onChange: (v: SessionDetails) => void;
  onValidChange?: (valid: boolean) => void;
};

const ALLOWED_DURATIONS = [30, 60] as const;

const PRESET_TAGS = [
  "HIIT",
  "Strength",
  "Mobility",
  "Yoga",
  "Pilates",
  "Endurance",
  "Calisthenics",
  "Dance",
  "Martial Arts",
  "Functional",
  "Core",
  "Cardio",
  "Balance",
  "Recovery",
  "Stretching",
] as const;

export default function StepSessionDetails({
  defaultValues,
  onChange,
  onValidChange,
}: Props) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );

  const initialDuration =
    defaultValues?.duration_min === 30 || defaultValues?.duration_min === 60
      ? (defaultValues.duration_min as 30 | 60)
      : 60;
  const [durationMin, setDurationMin] = useState<30 | 60>(initialDuration);

  const [capacity, setCapacity] = useState<number | "">(
    defaultValues?.capacity ?? ""
  );

  const [priceEuro, setPriceEuro] = useState<string>(() => {
    if (typeof defaultValues?.price_cents === "number") {
      return (defaultValues.price_cents / 100).toFixed(2);
    }
    return "";
  });

  const [imageUrl, setImageUrl] = useState(defaultValues?.image_url ?? "");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const price_cents = useMemo(() => {
    const n = Number(String(priceEuro).replace(",", "."));
    if (!Number.isFinite(n) || String(priceEuro).trim() === "") return null;
    const cents = Math.round(n * 100);
    return cents >= 0 ? cents : null;
  }, [priceEuro]);

  const [fitnessLevel, setFitnessLevel] = useState<string>(
    defaultValues?.recommended_level ?? ""
  );

  const isValid = useMemo(() => {
    if (title.trim().length < 3) return false;
    if (!ALLOWED_DURATIONS.includes(durationMin)) return false;
    if (
      capacity !== "" &&
      (!Number.isFinite(Number(capacity)) || Number(capacity) < 1)
    )
      return false;
    if (price_cents !== null && price_cents < 0) return false;
    return true;
  }, [title, durationMin, capacity, price_cents]);

  useEffect(() => {
    onChange({
      title: title.trim(),
      description: description?.trim() || "",
      duration_min: durationMin,
      capacity: capacity === "" ? null : Number(capacity),
      tags,
      price_cents,
      image_url: imageUrl?.trim() ? imageUrl.trim() : null,
      recommended_level: fitnessLevel ? fitnessLevel : null, // ✅ neu
    });
  }, [
    title,
    description,
    durationMin,
    capacity,
    tags,
    price_cents,
    imageUrl,
    fitnessLevel,
    onChange,
  ]);

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  function togglePresetTag(t: string) {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }
  function addTagFromInput() {
    const raw = tagInput.trim();
    if (!raw) return;
    const parts = raw
      .split(/[,;]+|\s{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
    const next = Array.from(new Set([...tags, ...parts])).slice(0, 50);
    setTags(next);
    setTagInput("");
  }
  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  async function handleFile(file: File) {
    if (!file) return;

    const supa = supabaseBrowser();

    // Pfad bauen (ohne userId geht's auch; schöner wäre: userId/folder/...)
    const ext = file.name.split(".").pop() || "jpg";
    const path = `sessions/${crypto.randomUUID()}.${ext}`;

    // 1) Upload
    const { error: upErr } = await supa.storage
      .from("session-images") // <- DEIN Bucketname (public)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (upErr) {
      console.error(upErr);
      // Fallback: nur lokale Vorschau zeigen, aber NICHT speichern!
      const preview = URL.createObjectURL(file);
      setUploadPreview(preview);
      return;
    }

    // 2) Public-URL erzeugen (keine Netzwerkanfrage, nur Stringbau)
    const { data: pub } = supa.storage
      .from("session-images")
      .getPublicUrl(path);

    // 3) In State übernehmen (das ist dann die URL, die du später im Payload speicherst)
    setUploadPreview(pub.publicUrl);
    setImageUrl(pub.publicUrl);
  }

  return (
    <section className="space-y-5">
      <h3 className="text-sm font-semibold text-slate-700">
        4) Session-Details
      </h3>

      {/* Titel */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Titel *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z. B. Mobility Flow"
          className={clsx(
            "w-full rounded-md border px-3 py-2",
            title.trim().length < 3 && "border-rose-400"
          )}
          required
        />
        <p className="text-xs text-slate-500">Mind. 3 Zeichen.</p>
      </div>

      {/* Beschreibung */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Beschreibung</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Worum geht's? Zielgruppe? Was mitbringen?"
        />
      </div>

      {/* Dauer + Kapazität */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Dauer *</label>
          <div className="flex gap-2">
            {ALLOWED_DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationMin(d)}
                className={clsx(
                  "rounded-md px-3 py-2 text-sm ring-1 ring-inset",
                  durationMin === d
                    ? "bg-black text-white ring-black"
                    : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                )}
                aria-pressed={durationMin === d}
              >
                {d} Min
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Kapazität</label>
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) =>
              setCapacity(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full rounded-md border px-3 py-2"
            placeholder="leer lassen = von Location übernehmen"
          />
        </div>
      </div>

      {/* Preis */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Preis (EUR)</label>
        <input
          inputMode="decimal"
          value={priceEuro}
          onChange={(e) => setPriceEuro(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="leer lassen = von Location übernehmen"
        />
      </div>

      {/* Fitness Level */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Fitness Level</label>
        <select
          value={fitnessLevel}
          onChange={(e) => setFitnessLevel(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Bitte wählen</option>
          <option value="beginner">Anfänger</option>
          <option value="intermediate">Fortgeschritten</option>
          <option value="advanced">Experte</option>
        </select>
      </div>

      {/* Bild */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Bild</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="text-sm"
          />
          <span className="text-xs text-slate-500">
            (Jetzt nur Vorschau – später Upload zu Supabase Storage)
          </span>
        </div>
        {(uploadPreview || imageUrl) && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadPreview || imageUrl || ""}
              alt="Preview"
              className="h-40 w-full max-w-sm rounded-md object-cover ring-1 ring-black/5"
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>

        <div className="flex flex-wrap gap-1.5">
          {PRESET_TAGS.map((t) => {
            const active = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => togglePresetTag(t)}
                className={clsx(
                  "rounded-full px-3 py-1 text-xs ring-1 ring-inset",
                  active
                    ? "bg-black text-white ring-black"
                    : "bg-slate-50 text-slate-800 ring-slate-200 hover:bg-slate-100"
                )}
                aria-pressed={active}
              >
                #{t}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "," || e.key === ";") {
                e.preventDefault();
                addTagFromInput();
              }
            }}
            className="flex-1 rounded-md border px-3 py-2"
            placeholder="Eigenen Tag eingeben und Enter / , drücken"
          />
          <button
            type="button"
            onClick={addTagFromInput}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Hinzufügen
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <span className="text-sm text-slate-500">Keine Tags</span>
          ) : (
            tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 ring-1 ring-slate-200 px-2.5 py-1 text-xs text-slate-700"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="rounded-full px-1 leading-none hover:bg-slate-200"
                  aria-label={`Tag ${t} entfernen`}
                  title="entfernen"
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {!isValid && (
        <div className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Bitte Titel (≥3) und gültige Werte prüfen. Dauer ist nur 30 oder 60
          Min.
        </div>
      )}
    </section>
  );
}
