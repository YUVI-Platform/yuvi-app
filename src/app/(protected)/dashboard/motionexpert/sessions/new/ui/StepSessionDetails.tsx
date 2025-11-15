// src/app/(protected)/dashboard/motionexpert/sessions/new/ui/StepSessionDetails.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export type SessionDetails = {
  title: string;
  description?: string;
  duration_min: number;
  capacity?: number | null;
  price_cents?: number | null;
  tags?: string[];

  // ⬇️ neu: mehrere Bilder (primäres = erstes)
  image_urls?: string[]; // primary = [0]
  image_url?: string | null; // legacy/back-compat (wird intern auf [0] gesetzt)

  // ⬇️ empfohlenes Level
  recommended_level?: "beginner" | "intermediate" | "advanced" | null;

  // Self-Hosted Location per ID referenzieren
  self_hosted_location_id?: string | null;
};

type LocationLite = {
  id: string;
  max_participants: number | null;
  price_per_slot: number | null; // cents
  title?: string | null;
};

type Props = {
  defaultValues?: Partial<SessionDetails>;
  onChange: (v: SessionDetails) => void;
  onValidChange?: (valid: boolean) => void;
  location?: LocationLite | null;
  locationId?: string;
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

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
type Level = (typeof LEVELS)[number];

export default function StepSessionDetails({
  defaultValues,
  onChange,
  onValidChange,
  location,
  locationId,
}: Props) {
  // ---------- Basestates ----------
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [durationMin, setDurationMin] = useState<30 | 60>(
    defaultValues?.duration_min === 30 || defaultValues?.duration_min === 60
      ? (defaultValues.duration_min as 30 | 60)
      : 60
  );

  // Kapazität: "" bedeutet „von Location übernehmen“
  const [capacity, setCapacity] = useState<number | "">(
    defaultValues?.capacity ?? ""
  );

  // Preis (EUR Eingabe -> cents intern)
  const [priceEuro, setPriceEuro] = useState<string>(() =>
    typeof defaultValues?.price_cents === "number"
      ? (defaultValues.price_cents / 100).toFixed(2)
      : ""
  );
  const price_cents = useMemo(() => {
    const n = Number(String(priceEuro).replace(",", "."));
    if (!Number.isFinite(n) || String(priceEuro).trim() === "") return null;
    const cents = Math.round(n * 100);
    return cents >= 0 ? cents : null;
  }, [priceEuro]);

  // ⬇️ neu: mehrere Bilder
  const [imageUrls, setImageUrls] = useState<string[]>(
    defaultValues?.image_urls && defaultValues.image_urls.length > 0
      ? defaultValues.image_urls
      : defaultValues?.image_url
      ? [defaultValues.image_url]
      : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  // ⬇️ empfohlenes Level
  const [fitnessLevel, setFitnessLevel] = useState<Level | "">(
    (defaultValues?.recommended_level ?? "") as Level | ""
  );

  // ---------- Location-Daten ----------
  const [locMax, setLocMax] = useState<number | null>(null);
  const [locPriceCents, setLocPriceCents] = useState<number | null>(null);

  // 1) Wenn Location-Objekt kommt: direkt übernehmen
  useEffect(() => {
    if (!location) return;
    setLocMax(
      typeof location.max_participants === "number"
        ? location.max_participants
        : null
    );
    setLocPriceCents(
      typeof location.price_per_slot === "number"
        ? location.price_per_slot
        : null
    );
    if (capacity === "" && typeof location.max_participants === "number") {
      setCapacity(location.max_participants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.id]);

  // 2) Fallback: nur ID -> fetch
  useEffect(() => {
    let cancelled = false;
    async function loadById() {
      if (location || !locationId) return;
      const supa = supabaseBrowser();
      const { data, error } = await supa
        .from("studio_locations")
        .select("max_participants, price_per_slot")
        .eq("id", locationId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error(error);
        setLocMax(null);
        setLocPriceCents(null);
        return;
      }
      const maxP =
        typeof data?.max_participants === "number"
          ? data.max_participants
          : null;
      setLocMax(maxP);
      setLocPriceCents(
        typeof data?.price_per_slot === "number" ? data.price_per_slot : null
      );
      if (capacity === "" && typeof maxP === "number") setCapacity(maxP);
    }
    loadById();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  // ---------- Validation ----------
  const isValid = useMemo(() => {
    if (title.trim().length < 3) return false;
    if (!ALLOWED_DURATIONS.includes(durationMin)) return false;
    if (
      capacity !== "" &&
      (!Number.isFinite(Number(capacity)) || Number(capacity) < 1)
    )
      return false;
    if (price_cents !== null && price_cents < 0) return false;
    if (locMax && typeof capacity === "number" && capacity > locMax)
      return false;
    return true;
  }, [title, durationMin, capacity, price_cents, locMax]);

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  // ---------- Upstream sync ----------
  useEffect(() => {
    const trimmedImages = imageUrls.filter(Boolean);
    const payload: SessionDetails = {
      title: title.trim(),
      description: description?.trim() || "",
      duration_min: durationMin,
      capacity: capacity === "" ? null : Number(capacity),
      tags,
      price_cents,
      recommended_level: fitnessLevel === "" ? null : fitnessLevel,
      self_hosted_location_id: defaultValues?.self_hosted_location_id ?? null,

      // ⬇️ Mehrfachbilder nach oben geben (und legacy field füllen)
      image_urls: trimmedImages,
      image_url: trimmedImages.length ? trimmedImages[0] : null,
    };

    onChange(payload);
  }, [
    title,
    description,
    durationMin,
    capacity,
    tags,
    price_cents,
    imageUrls,
    fitnessLevel,
    onChange,
    defaultValues?.self_hosted_location_id,
  ]);

  // ---------- Tag Helpers ----------
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

  // ---------- Upload (multi) ----------
  const dropRef = useRef<HTMLLabelElement>(null);

  async function uploadOne(file: File): Promise<string> {
    if (!file.type.startsWith("image/"))
      throw new Error("Nur Bilddateien erlaubt.");
    if (file.size > 8 * 1024 * 1024) throw new Error("Max. 8 MB pro Bild.");

    const supa = supabaseBrowser();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `sessions/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supa.storage
      .from("session-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (upErr) throw upErr;

    const { data: pub } = supa.storage
      .from("session-images")
      .getPublicUrl(path);
    return pub.publicUrl;
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setUploadError(null);
    setUploading(true);
    try {
      const newUrls: string[] = [];
      // sequenziell (einfach & stabil); wenn du willst: Promise.all mit Limit
      for (const f of list) {
        const url = await uploadOne(f);
        newUrls.push(url);
      }
      setImageUrls((prev) => {
        // dedupe
        const merged = [...prev, ...newUrls].filter(
          (v, i, a) => a.indexOf(v) === i
        );
        return merged.slice(0, 10); // hard limit 10 Bilder
      });
    } catch (e: unknown) {
      console.error(e);
      const msg =
        e instanceof Error && e.message ? e.message : "Upload fehlgeschlagen.";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }
  function setAsCover(url: string) {
    setImageUrls((prev) => {
      const rest = prev.filter((u) => u !== url);
      return [url, ...rest];
    });
  }

  // ---------- Break-even ----------
  const effectiveCapacity =
    capacity === ""
      ? typeof locMax === "number"
        ? locMax
        : null
      : Number(capacity);

  const breakEven = useMemo(() => {
    if (!locPriceCents || !price_cents || price_cents <= 0) return null;
    const needed = Math.ceil(locPriceCents / price_cents);
    const feasible =
      typeof effectiveCapacity === "number"
        ? needed <= effectiveCapacity
        : true;
    const fullRevenue =
      typeof effectiveCapacity === "number"
        ? effectiveCapacity * price_cents
        : null;
    const profitAtFull =
      fullRevenue !== null ? fullRevenue - locPriceCents : null;
    const suggestedPricePerHead =
      typeof effectiveCapacity === "number" && effectiveCapacity > 0
        ? Math.ceil((locPriceCents / effectiveCapacity) * 1.2)
        : null;
    return { needed, feasible, profitAtFull, suggestedPricePerHead };
  }, [locPriceCents, price_cents, effectiveCapacity]);

  const fmtEUR = (cents: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);

  // ---------- Capacity UI handlers ----------
  function incCapacity() {
    const current = capacity === "" ? locMax ?? 0 : Number(capacity);
    const next = current + 1;
    setCapacity(locMax ? Math.min(next, locMax) : next);
  }
  function decCapacity() {
    const current = capacity === "" ? locMax ?? 1 : Number(capacity);
    const next = Math.max(current - 1, 1);
    setCapacity(next);
  }

  const capNum = capacity === "" ? null : Number(capacity);
  const capDisplay = capNum ?? locMax ?? "—";
  const hasLimit = typeof locMax === "number";

  return (
    <section className="space-y-6">
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Dauer */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dauer *</label>
          <div className="inline-flex rounded-lg ring-1 ring-slate-200 overflow-hidden">
            {ALLOWED_DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDurationMin(d)}
                className={clsx(
                  "px-3 py-2 text-sm",
                  durationMin === d
                    ? "bg-black text-white"
                    : "bg-white hover:bg-slate-50"
                )}
                aria-pressed={durationMin === d}
              >
                {d} Min
              </button>
            ))}
          </div>
        </div>

        {/* Kapazität mit Limit-Info */}
        <div className="space-y-1">
          <label className="text-sm font-medium flex items-center justify-between">
            <span>Kapazität</span>
            {hasLimit && (
              <span className="text-xs text-slate-500">
                Max. laut Location: <strong>{locMax}</strong>
              </span>
            )}
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decCapacity}
              className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
              aria-label="Kapazität verringern"
            >
              –
            </button>

            <input
              type="number"
              min={1}
              {...(hasLimit ? { max: locMax! } : {})}
              value={capacity}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") return setCapacity("");
                const val = Number(raw);
                if (!Number.isFinite(val) || val < 1) return;
                setCapacity(hasLimit ? Math.min(val, locMax!) : val);
              }}
              className={clsx(
                "w-24 rounded-md border px-3 py-2 text-center",
                hasLimit &&
                  typeof capNum === "number" &&
                  capNum > (locMax ?? Infinity) &&
                  "border-rose-400"
              )}
              placeholder="leer = Location"
            />

            <button
              type="button"
              onClick={incCapacity}
              className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
              aria-label="Kapazität erhöhen"
            >
              +
            </button>

            <div className="ml-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {typeof capDisplay === "number" && hasLimit
                ? `${capDisplay} von max ${locMax}`
                : typeof capDisplay === "number"
                ? `${capDisplay} Personen`
                : "von Location übernehmen"}
            </div>
          </div>

          {hasLimit && typeof capNum === "number" && capNum >= locMax! && (
            <p className="text-xs text-amber-600 mt-1">
              Du hast die maximale Kapazität der Location erreicht.
            </p>
          )}
        </div>
      </div>

      {/* Preis pro Teilnehmer */}
      <div className="space-y-1">
        <label className="text-sm font-medium flex items-center justify-between">
          <span>Preis (EUR pro Teilnehmer)</span>
          {locPriceCents !== null && (
            <span className="text-xs text-slate-500">
              Studio-Preis pro Slot: <strong>{fmtEUR(locPriceCents)}</strong>
            </span>
          )}
        </label>

        <input
          inputMode="decimal"
          value={priceEuro}
          onChange={(e) => setPriceEuro(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="z. B. 15,00"
        />

        {/* Break-even Hinweis */}
        <div className="mt-1 text-xs">
          {!locPriceCents ? (
            <span className="text-slate-500">
              Kein Studio-Preis hinterlegt — füge in der Location{" "}
              <b>Preis pro Slot</b> hinzu.
            </span>
          ) : price_cents === null || price_cents <= 0 ? (
            <span className="text-slate-500">
              Gib einen Sessionpreis ein, um die Rentabilität zu sehen.
            </span>
          ) : (
            breakEven && (
              <span
                className={clsx(
                  "inline-block rounded-md px-2 py-1",
                  breakEven.feasible
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                )}
              >
                Break-even bei <b>{breakEven.needed}</b> Teilnehmer
                {breakEven.needed === 1 ? "" : "n"}
                {typeof effectiveCapacity === "number" &&
                breakEven.needed > effectiveCapacity
                  ? " (über deiner Kapazität)"
                  : ""}
                .
                {typeof effectiveCapacity === "number" &&
                  breakEven.profitAtFull !== null && (
                    <>
                      {" "}
                      Gewinn bei voller Auslastung ({effectiveCapacity}):{" "}
                      <b>{fmtEUR(breakEven.profitAtFull!)}</b>
                    </>
                  )}
                {breakEven.suggestedPricePerHead && (
                  <>
                    {" "}
                    · Vorschlag:{" "}
                    <b>{fmtEUR(breakEven.suggestedPricePerHead)}</b> pro TN
                    (inkl. ~20% Puffer)
                  </>
                )}
              </span>
            )
          )}
        </div>
      </div>

      {/* Empfohlenes Fitnesslevel */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Empfohlenes Fitnesslevel</label>
        <select
          value={fitnessLevel}
          onChange={(e) => {
            const val = e.target.value as Level | "";
            if (val === "" || LEVELS.includes(val)) setFitnessLevel(val);
          }}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Bitte wählen</option>
          <option value="beginner">Anfänger</option>
          <option value="intermediate">Fortgeschritten</option>
          <option value="advanced">Experte</option>
        </select>
        <p className="text-xs text-slate-500">
          Hilft Athlet:innen, die passende Session zu finden.
        </p>
      </div>

      {/* Bilder (multi) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Bilder (erstes = Cover)</label>

        <label
          ref={dropRef}
          onDragOver={(e) => {
            e.preventDefault();
            dropRef.current?.classList.add("ring-2", "ring-black");
          }}
          onDragLeave={() =>
            dropRef.current?.classList.remove("ring-2", "ring-black")
          }
          onDrop={(e) => {
            e.preventDefault();
            dropRef.current?.classList.remove("ring-2", "ring-black");
            if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
          }}
          className={clsx(
            "flex cursor-pointer items-center justify-center rounded-md border border-dashed px-4 py-10 text-center",
            "bg-slate-50 hover:bg-slate-100"
          )}
        >
          <div>
            <div className="text-sm font-medium">
              Dateien hierher ziehen oder klicken
            </div>
            <div className="text-xs text-slate-500 mt-1">
              JPG/PNG/WEBP/AVIF, max. 8 MB pro Bild, bis zu 10 Bilder
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </label>

        {uploading && (
          <span className="text-xs text-slate-500">Lade hoch…</span>
        )}
        {uploadError && (
          <span className="text-xs text-rose-600">{uploadError}</span>
        )}

        {imageUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            {imageUrls.map((u, idx) => (
              <div
                key={u}
                className="relative rounded-md overflow-hidden ring-1 ring-black/5 bg-slate-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u}
                  alt={`Bild ${idx + 1}`}
                  className="h-32 w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1 bg-black/40">
                  <button
                    type="button"
                    onClick={() => setAsCover(u)}
                    className={clsx(
                      "flex-1 rounded-sm px-2 py-1 text-[11px] text-white",
                      idx === 0
                        ? "bg-emerald-600"
                        : "bg-slate-700 hover:bg-slate-600"
                    )}
                    title={idx === 0 ? "Ist Cover" : "Als Cover setzen"}
                  >
                    {idx === 0 ? "Cover" : "Als Cover"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(u)}
                    className="rounded-sm px-2 py-1 text-[11px] text-white bg-rose-600 hover:bg-rose-700"
                    title="Entfernen"
                  >
                    Entfernen
                  </button>
                </div>
              </div>
            ))}
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
          Bitte Eingabe überprüfen. Alle mit * markierten Felder sind
          erforderlich und müssen korrekt ausgefüllt sein.
        </div>
      )}
    </section>
  );
}
