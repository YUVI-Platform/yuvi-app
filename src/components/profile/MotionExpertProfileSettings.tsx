// src/components/profile/MotionExpertProfileSettings.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseBrowser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Wallet,
  Sparkles,
  Plus,
  X,
  EyeClosedIcon,
  EyeIcon,
  Edit3,
} from "lucide-react";
import Image from "next/image";

type MotionExpertProfileRow = {
  user_id: string;
  bio: string | null;
  is_public: boolean | null;
  licenses: string[] | null;
  paypal_link: string | null;
  portfolio_image_urls: string[] | null;
  training_focus: string[] | null;
};

const SPECIALTIES = [
  "Mobility",
  "HIIT",
  "Strength",
  "Yoga",
  "Pilates",
  "Endurance",
  "Dance",
  "Martial Arts",
  "Calisthenics",
  "Functional Training",
];

export default function MotionExpertProfileSettings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MotionExpertProfileRow | null>(null);
  const [initialProfile, setInitialProfile] =
    useState<MotionExpertProfileRow | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [newLicense, setNewLicense] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const isDirty = useMemo(() => {
    if (!profile || !initialProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
  }, [profile, initialProfile]);

  const isReadOnly = !isEditing;

  // Initial load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr) {
        if (!cancelled) setError(authErr.message);
        setLoading(false);
        return;
      }
      if (!user) {
        if (!cancelled) setError("Nicht eingeloggt.");
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error: profileErr } = await supabase
        .from("motion_expert_profiles")
        .select(
          "user_id, bio, is_public, licenses, paypal_link, portfolio_image_urls, training_focus"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileErr) {
        if (!cancelled) setError(profileErr.message);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        const base: MotionExpertProfileRow = data ?? {
          user_id: user.id,
          bio: "",
          is_public: true,
          licenses: [],
          paypal_link: "",
          portfolio_image_urls: [],
          training_focus: [],
        };

        setProfile(base);
        setInitialProfile(base);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSpecialty = (s: string) => {
    if (!profile || isReadOnly) return;
    const current = profile.training_focus ?? [];
    const exists = current.includes(s);
    const updated = exists
      ? current.filter((item) => item !== s)
      : [...current, s];
    setProfile({ ...profile, training_focus: updated });
  };

  const addLicense = () => {
    if (!profile || !newLicense.trim() || isReadOnly) return;
    const list = profile.licenses ?? [];
    if (list.includes(newLicense.trim())) {
      setNewLicense("");
      return;
    }
    setProfile({
      ...profile,
      licenses: [...list, newLicense.trim()],
    });
    setNewLicense("");
  };

  const removeLicense = (license: string) => {
    if (!profile || isReadOnly) return;
    const list = profile.licenses ?? [];
    setProfile({
      ...profile,
      licenses: list.filter((l) => l !== license),
    });
  };

  const removePortfolioUrl = (url: string) => {
    if (!profile || isReadOnly) return;
    const list = profile.portfolio_image_urls ?? [];
    setProfile({
      ...profile,
      portfolio_image_urls: list.filter((u) => u !== url),
    });
  };

  const handlePortfolioFiles = async (files: FileList | File[] | null) => {
    if (!files || !profile || isReadOnly || !userId) return;

    setUploading(true);
    setUploadError(null);

    const fileArray = Array.from(files);
    const bucket = "portfolio"; // ⬅️ ggf. an deinen Bucket-Namen anpassen

    try {
      const newUrls: string[] = [];

      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) continue;

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`;
        const filePath = `${userId}/portfolio/${fileName}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error(error);
          setUploadError(error.message);
          continue;
        }

        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        if (publicData?.publicUrl) {
          newUrls.push(publicData.publicUrl);
        }
      }

      if (newUrls.length) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                portfolio_image_urls: [
                  ...(prev.portfolio_image_urls ?? []),
                  ...newUrls,
                ],
              }
            : prev
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !userId || !isDirty) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      user_id: userId,
      bio: profile.bio?.trim() || null,
      is_public: profile.is_public ?? true,
      licenses:
        profile.licenses && profile.licenses.length ? profile.licenses : null,
      paypal_link: profile.paypal_link?.trim() || null,
      portfolio_image_urls:
        profile.portfolio_image_urls && profile.portfolio_image_urls.length
          ? profile.portfolio_image_urls
          : null,
      training_focus:
        profile.training_focus && profile.training_focus.length
          ? profile.training_focus
          : null,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from("motion_expert_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (upsertErr) {
      setError(upsertErr.message);
      setSaving(false);
      return;
    }

    // nach erfolgreichem Save neue Basis für "clean"
    setInitialProfile(profile);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  if (loading || !profile) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span className="text-sm text-slate-500">Profil wird geladen…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: View/Edit Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">
            Motion Expert Profil
          </span>{" "}
          · Wallet & Sichtbarkeit
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-full border-slate-300 bg-white text-xs"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          <Edit3 className="mr-1 h-3 w-3" />
          {isEditing ? "Fertig" : "Bearbeiten"}
        </Button>
      </div>

      {/* Payment & Visibility */}
      <Card className="border-slate-200/70 bg-white/80 backdrop-blur-md p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-yuvi-skyblue" />
              <h2 className="text-base font-semibold">
                Payment & Sichtbarkeit
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Lege deinen PayPal-Link für Auszahlungen fest und bestimme, ob
              dein Profil öffentlich gelistet ist.
            </p>
          </div>

          <div
            className={
              "flex items-center gap-2 rounded-full px-3 py-1 transform transition-colors duration-400" +
              (profile.is_public
                ? " bg-emerald-100 text-emerald-700 border border-emerald-400"
                : " bg-blue-100 text-blue-500 border border-blue-500")
            }
          >
            {profile.is_public ? (
              <EyeIcon className="h-4 w-4" />
            ) : (
              <EyeClosedIcon className="h-4 w-4" />
            )}
            <span
              className={
                "text-xs font-medium" +
                (profile.is_public ? " text-emerald-700" : " text-blue-500")
              }
            >
              {profile.is_public ? "Öffentlich" : "Versteckt"}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Profil-Sichtbarkeit
              </p>
              <p className="text-sm text-slate-700">
                {profile.is_public
                  ? "Dein Profil erscheint in Suchen und Listen."
                  : "Nur du und eingeladene Athletes sehen dein Profil."}
              </p>
            </div>
            <Switch
              checked={!!profile.is_public}
              onCheckedChange={(checked) =>
                setProfile({ ...profile, is_public: checked })
              }
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              PayPal Link
            </label>
            <Input
              placeholder="https://paypal.me/deinname"
              value={profile.paypal_link ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, paypal_link: e.target.value })
              }
              disabled={isReadOnly}
            />
            <p className="text-xs text-slate-400">
              Nutze deinen persönlichen PayPal.me-Link. Athletes verwenden ihn
              für direkte Zahlungen.
            </p>
          </div>
        </div>
      </Card>

      {/* Bio & Training Focus */}
      <Card className="border-slate-200/70 bg-white/80 backdrop-blur-md p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-pink-500" />
          <h2 className="text-base font-semibold">Über dich & Schwerpunkte</h2>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Kurz-Bio
            </label>
            <Textarea
              rows={4}
              placeholder="Was motiviert dich? Welche Art von Sessions bietest du an?"
              value={profile.bio ?? ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={isReadOnly}
            />
            <p className="text-xs text-slate-400">
              Kurzer Text, der Athletes hilft, dich auf einen Blick zu
              verstehen.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Training Focus
            </p>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => {
                const active = profile.training_focus?.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialty(s)}
                    disabled={isReadOnly}
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-yuvi-skyblue bg-yuvi-skyblue/10 text-yuvi-skyblue"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    } ${
                      isReadOnly
                        ? "cursor-default opacity-60 hover:border-slate-200"
                        : ""
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {profile.training_focus && profile.training_focus.length > 0 && (
              <p className="text-xs text-slate-400">
                Aktive Tags: {profile.training_focus.join(", ")}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Licenses & Portfolio */}
      <Card className="border-slate-200/70 bg-white/80 backdrop-blur-md p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">
            Qualifikationen & Portfolio
          </h2>
        </div>

        {/* Licenses */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Lizenzen / Zertifikate
          </p>
          <div className="flex flex-wrap gap-2">
            {(profile.licenses ?? []).map((license) => (
              <Badge
                key={license}
                variant="secondary"
                className="flex items-center gap-1 rounded-full bg-slate-100 text-slate-700"
              >
                {license}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removeLicense(license)}
                    className="ml-1 inline-flex"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {(!profile.licenses || profile.licenses.length === 0) && (
              <p className="text-xs text-slate-400">
                Noch keine Lizenzen hinterlegt.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="z. B. Fitnesstrainer B-Lizenz"
              value={newLicense}
              onChange={(e) => setNewLicense(e.target.value)}
              disabled={isReadOnly}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addLicense}
              disabled={isReadOnly}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Portfolio Bilder */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Portfolio-Bilder
          </p>

          {/* Grid mit Thumbnails */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(profile.portfolio_image_urls ?? []).map((url) => (
              <div
                key={url}
                className="group relative aspect-[4/5] overflow-hidden rounded-lg border bg-slate-50"
              >
                <Image
                  src={url}
                  alt="Portfolio Bild"
                  width={100}
                  height={125}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removePortfolioUrl(url)}
                    className="absolute right-1 top-1 inline-flex rounded-full bg-black/60 p-1 text-white shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}

            {(!profile.portfolio_image_urls ||
              profile.portfolio_image_urls.length === 0) && (
              <div className="col-span-full rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-400">
                Noch keine Bilder im Portfolio.{" "}
                {isEditing && "Füge ein paar Eindrücke deiner Sessions hinzu."}
              </div>
            )}
          </div>

          {/* Upload-Zone */}
          <div
            className={`mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center text-xs transition
      ${
        isReadOnly
          ? "cursor-default border-slate-200 bg-slate-50 text-slate-400 opacity-60"
          : isDragActive
          ? "cursor-pointer border-yuvi-skyblue bg-yuvi-skyblue/5 text-yuvi-skyblue"
          : "cursor-pointer border-slate-300 bg-slate-50/70 text-slate-500 hover:border-slate-400"
      }`}
            onClick={() => {
              if (isReadOnly) return;
              fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              if (isReadOnly) return;
              e.preventDefault();
              setIsDragActive(true);
            }}
            onDragLeave={(e) => {
              if (isReadOnly) return;
              e.preventDefault();
              setIsDragActive(false);
            }}
            onDrop={(e) => {
              if (isReadOnly) return;
              e.preventDefault();
              setIsDragActive(false);
              handlePortfolioFiles(e.dataTransfer.files);
            }}
          >
            <p className="font-medium">
              {isReadOnly
                ? "Bearbeiten aktivieren, um Bilder hochzuladen"
                : "Bilder hierher ziehen (Desktop) oder tippen zum Auswählen"}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              JPG, PNG oder WebP · max. ein paar MB pro Bild · mehrere Dateien
              erlaubt
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-3 rounded-full border-slate-300 bg-white px-3 py-1 text-[11px]"
              disabled={isReadOnly || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Upload läuft…
                </>
              ) : (
                "Dateien auswählen"
              )}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePortfolioFiles(e.target.files)}
              disabled={isReadOnly}
            />
          </div>

          {uploadError && (
            <p className="mt-1 text-xs text-red-500">
              Fehler beim Upload: {uploadError}
            </p>
          )}
        </div>
      </Card>

      {/* Save bar – nur wenn im Edit-Mode UND dirty */}
      {isEditing && isDirty && (
        <div className="sticky bottom-4 z-10 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border bg-white/90 shadow-sm animate-bounce  t">
            {error && (
              <span className="max-w-[220px] truncate text-xs text-red-500">
                {error}
              </span>
            )}
            {success && !error && (
              <span className="text-xs text-emerald-600">Gespeichert ✔</span>
            )}
            <Button
              type="button"
              size="sm"
              className="rounded-full bg-yuvi-rose px-4 text-lg font-fancy font-semibold tracking-wider text-pink-700 hover:bg-pink-200  md:hover:scale-105 cursor-pointer transition-all duration-300 ease-in-ou"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  SPEICHERN…
                </>
              ) : (
                "ÄNDERUNGEN SPEICHERN"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

//TODO: Microinteractions für Buttons und Switches hinzufügen bsp. Visibilty switch animation des auges
//TODO: Specialties Tags müssen global definiert werden um konsistenz zu gewährleisten
