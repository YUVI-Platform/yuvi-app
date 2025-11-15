// src/components/profile/AthleteProfileSettings.tsx
"use client";

import { useEffect, useMemo, useState } from "react"; // ⬅️ useRef entfernt
import { supabase } from "@/lib/supabaseBrowser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit3, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type AthleteProfileRow = {
  user_id: string;
  fitness_level: "beginner" | "intermediate" | "expert" | null;
  about_me: string | null;
};

const FITNESS_LEVELS = [
  { value: "beginner", label: "Anfänger", hint: "Starte entspannt & sicher" },
  { value: "intermediate", label: "Fortgeschritten", hint: "Mehr Intensität" },
  { value: "expert", label: "Experte", hint: "High Performance" },
] as const;

export default function AthleteProfileSettings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AthleteProfileRow | null>(null);
  const [initialProfile, setInitialProfile] =
    useState<AthleteProfileRow | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isDirty = useMemo(() => {
    if (!profile || !initialProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
  }, [profile, initialProfile]);

  const isReadOnly = !isEditing;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);

      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr || !auth?.user) {
        if (!cancelled) {
          setError(authErr?.message || "Nicht eingeloggt.");
          setLoading(false);
        }
        return;
      }
      setUserId(auth.user.id);

      // ✅ nur existierende Spalten selektieren
      const { data, error: profErr } = await supabase
        .from("athlete_profiles")
        .select("user_id, fitness_level, about_me")
        .eq("user_id", auth.user.id)
        .maybeSingle();

      if (profErr) {
        if (!cancelled) {
          setError(profErr.message);
          setLoading(false);
        }
        return;
      }

      const base: AthleteProfileRow = {
        user_id: auth.user.id,
        fitness_level:
          (data?.fitness_level as AthleteProfileRow["fitness_level"]) ??
          "beginner",
        about_me: (data?.about_me as string | null) ?? "",
      };

      if (!cancelled) {
        setProfile(base);
        setInitialProfile(base);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    if (!profile || !userId || !isDirty) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      user_id: userId,
      fitness_level: profile.fitness_level ?? "beginner",
      about_me: profile.about_me?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase
      .from("athlete_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (upsertErr) {
      setError(upsertErr.message);
      setSaving(false);
      return;
    }

    setInitialProfile(profile);
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  if (loading || !profile) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span className="text-sm text-slate-500">Profil wird geladen…</span>
      </div>
    );
  }

  const activeLevel = profile.fitness_level ?? "beginner";
  const others = FITNESS_LEVELS.filter((l) => l.value !== activeLevel);
  return (
    <div className="space-y-6">
      {/* Header: View/Edit Toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Athlete Profil</span> ·
          Fitness & Bio
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

      {/* Fitness Level */}
      <Card className="border-slate-200/70 bg-white/80 backdrop-blur-md p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-violet-200 border border-violet-400 text-violet-800 "
          >
            Level
          </Badge>
          <h2 className="text-base font-semibold">Fitness-Level</h2>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          {/* Always show the active level */}
          <motion.button
            key={activeLevel}
            type="button"
            disabled={isReadOnly}
            onClick={() =>
              !isReadOnly &&
              setProfile({
                ...profile,
                fitness_level: activeLevel as typeof profile.fitness_level,
              })
            }
            className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left transition
      border-yuvi-skyblue bg-yuvi-skyblue/10
      ${isReadOnly ? "cursor-default opacity-90" : ""}`}
            layout
          >
            <span className="text-sm font-medium text-yuvi-skyblue">
              {FITNESS_LEVELS.find((l) => l.value === activeLevel)?.label}
            </span>
            <span className="text-xs text-slate-500">
              {FITNESS_LEVELS.find((l) => l.value === activeLevel)?.hint}
            </span>
          </motion.button>

          {/* When editing, animate the other two options in */}
          <AnimatePresence initial={false}>
            {!isReadOnly &&
              others.map((lvl, idx) => (
                <motion.button
                  key={lvl.value}
                  type="button"
                  onClick={() =>
                    setProfile({ ...profile, fitness_level: lvl.value })
                  }
                  className="flex flex-col items-start rounded-lg border px-3 py-2 text-left
                     border-slate-200 bg-white hover:border-slate-300 transition"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, delay: 0.04 * idx }}
                  layout
                >
                  <span className="text-sm font-medium text-slate-800">
                    {lvl.label}
                  </span>
                  <span className="text-xs text-slate-500">{lvl.hint}</span>
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* About Me */}
      <Card className="border-slate-200/70 bg-white/80 backdrop-blur-md p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yuvi-rose" />
          <h2 className="text-base font-semibold">Über mich</h2>
        </div>
        <div className="mt-4 space-y-1">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Kurzbeschreibung
          </label>
          <Textarea
            rows={4}
            placeholder="Ziele, Sportarten, Einschränkungen…"
            value={profile.about_me ?? ""}
            onChange={(e) =>
              setProfile({ ...profile, about_me: e.target.value })
            }
            disabled={isReadOnly}
          />
          <p className="text-xs text-slate-400">
            Hilf Trainern & Studios, dich besser zu matchen.
          </p>
        </div>
      </Card>

      {/* Save bar – nur im Edit-Mode & wenn Änderungen */}
      {isEditing && isDirty && (
        <div className="sticky bottom-4 z-10 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border bg-white/90 px-3 py-2 shadow-sm">
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
              className="rounded-full bg-yuvi-rose px-4 font-fancy text-white hover:opacity-90 active:translate-y-px"
              onClick={handleSave}
              disabled={saving || !isDirty}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Speichern…
                </>
              ) : (
                "Änderungen speichern"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

//TODO: ATHLETE PROFIL UM ANAMNESE ERWEITERN (ALTER, GRÖSSE, GEWICHT, VERLETZUNGEN ETC)
//TODO: DIE KANN DANN DER TRAINER BEI DER TRAINER SUCHE SEHEN UND NUTZEN UM BESSER ZU MATCHEN
