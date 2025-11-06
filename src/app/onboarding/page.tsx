// app/onboarding/page.tsx
import { redirect } from "next/navigation";
import { supabaseServerAction, supabaseServerRead } from "@/lib/supabaseServer";
import OnboardingForm from "./ui/OnboardingForm";

/* =============== Rollen & Default-Typen (ohne Zod in dieser Datei) =============== */

type Role = "athlete" | "motionExpert" | "studioHost" | "admin";

type AthleteDefaults = {
  fitness_level?: "beginner" | "intermediate" | "expert";
  bio?: string;
};

type MotionExpertDefaults = {
  license_id?: string;
  specialties?: string[]; // aus DB als string[] erwartet
  portfolio_url?: string;
  bio?: string;
};

type StudioHostDefaults = {
  company?: string;
  phone?: string;
};

type RoleSpecificDefaults =
  | AthleteDefaults
  | MotionExpertDefaults
  | StudioHostDefaults
  | null;

/* ================================== Page ================================== */

export default async function OnboardingPage() {
  const supa = await supabaseServerRead();
  const { data: userData } = await supa.auth.getUser();
  const user = userData?.user;
  if (!user) redirect("/login");

  const uid = user.id;

  const { data: profile } = await supa
    .from("profiles")
    .select("onboarding_done")
    .eq("user_id", uid)
    .maybeSingle();

  if (profile?.onboarding_done) redirect("/profile");

  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);

  const role = roles?.map((r) => r.role).find((r) => r !== "admin") as
    | Role
    | undefined;

  if (!role) return <ChooseRoleForm uid={uid} />;

  const defaultValues = await getProfileDefaults(uid, role);

  return (
    <main className="mx-auto max-w-xl p-6 min-h-screen">
      <h1 className="mb-2 text-2xl font-semibold">Onboarding</h1>
      <p className="mb-6 text-slate-600">
        Rolle: <b>{roleLabel(role)}</b>
      </p>

      <OnboardingForm defaultValues={defaultValues.profile} uid={uid}>
        {renderRoleFields(role, defaultValues.roleSpecific)}
      </OnboardingForm>
    </main>
  );
}

/* ===================== Hilfskomponenten & Helpers ===================== */

function ChooseRoleForm({ uid }: { uid: string }) {
  return (
    <main className="mx-auto max-w-xl p-6 min-h-screen flex flex-col justify-center">
      <h1 className="mb-4 text-2xl font-semibold">Wähle deine Rolle</h1>
      <form action={chooseRoleAction}>
        <input type="hidden" name="uid" value={uid} />
        <div className="space-y-3">
          {["athlete", "motionExpert", "studioHost"].map((role) => (
            <label key={role} className="flex items-center gap-2">
              <input type="radio" name="role" value={role} required />{" "}
              {roleLabel(role as Role)}
            </label>
          ))}
        </div>
        <button className="mt-6 rounded-md bg-black px-4 py-2 text-white">
          Weiter
        </button>
      </form>
    </main>
  );
}

function roleLabel(r: Role) {
  return r === "motionExpert"
    ? "Motion Expert"
    : r === "studioHost"
    ? "Studio Host"
    : r === "athlete"
    ? "Athlete"
    : r;
}

function renderRoleFields(role: Role, values: RoleSpecificDefaults) {
  if (role === "athlete") {
    const v = (values ?? {}) as AthleteDefaults;
    return (
      <>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fitness Level</label>
          <select
            name="fitness_level"
            defaultValue={v.fitness_level ?? "beginner"}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="beginner">Anfänger</option>
            <option value="intermediate">Fortgeschritten</option>
            <option value="expert">Experte</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Kurzbeschreibung</label>
          <textarea
            name="bio"
            defaultValue={v.bio ?? ""}
            className="w-full rounded-md border px-3 py-2"
            rows={4}
            placeholder="Ziele, Sportarten, Einschränkungen…"
          />
        </div>
      </>
    );
  }

  if (role === "motionExpert") {
    const v = (values ?? {}) as MotionExpertDefaults;
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
    const selected = Array.isArray(v.specialties) ? v.specialties : [];

    return (
      <>
        <div className="space-y-1">
          <label className="text-sm font-medium">Lizenz / Zertifikat</label>
          <input
            name="license_id"
            defaultValue={v.license_id ?? ""}
            className="w-full rounded-md border px-3 py-2"
            placeholder="z. B. Fitnesstrainer B-Lizenz"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Schwerpunkte</label>
          <div className="grid grid-cols-2 gap-2">
            {SPECIALTIES.map((s) => (
              <label key={s} className="flex items-center gap-2">
                <input type="checkbox" name="specialties" value={s} />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Portfolio Bilder</label>
          <input
            type="file"
            name="portfolio_images"
            accept="image/*"
            multiple
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Kurz-Bio</label>
          <textarea
            name="bio"
            defaultValue={v.bio ?? ""}
            className="w-full rounded-md border px-3 py-2"
            rows={4}
            placeholder="Was motiviert dich? Was bietest du an?"
          />
        </div>
      </>
    );
  }

  if (role === "studioHost") {
    const v = (values ?? {}) as StudioHostDefaults;
    return (
      <>
        <div className="space-y-1">
          <label className="text-sm font-medium">Firma</label>
          <input
            name="company"
            defaultValue={v.company ?? ""}
            className="w-full rounded-md border px-3 py-2"
            placeholder="z. B. Urban Moves GmbH"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Telefon</label>
          <input
            name="phone"
            defaultValue={v.phone ?? ""}
            className="w-full rounded-md border px-3 py-2"
            placeholder="+49…"
            required
          />
        </div>
      </>
    );
  }

  return null;
}

async function getProfileDefaults(
  uid: string,
  role: Role
): Promise<{
  profile: { name: string; alias: string; avatar_url: string };
  roleSpecific: RoleSpecificDefaults;
}> {
  const supa = await supabaseServerRead();

  const { data: profileData } = await supa
    .from("profiles")
    .select("name, alias, avatar_url")
    .eq("user_id", uid)
    .maybeSingle();

  let roleSpecific: RoleSpecificDefaults = null;

  if (role === "athlete") {
    const { data } = await supa
      .from("athlete_profiles")
      .select("fitness_level, bio")
      .eq("user_id", uid)
      .maybeSingle();
    roleSpecific = (data ?? {}) as AthleteDefaults;
  }

  if (role === "motionExpert") {
    const { data } = await supa
      .from("motion_expert_profiles")
      .select("license_id, specialties, portfolio_url, bio")
      .eq("user_id", uid)
      .maybeSingle();
    roleSpecific = (data ?? {}) as MotionExpertDefaults;
  }

  if (role === "studioHost") {
    const { data } = await supa
      .from("studio_host_profiles")
      .select("company, phone")
      .eq("user_id", uid)
      .maybeSingle();
    roleSpecific = (data ?? {}) as StudioHostDefaults;
  }

  return {
    profile: {
      name: profileData?.name ?? "",
      alias: profileData?.alias ?? "",
      avatar_url: profileData?.avatar_url ?? "",
    },
    roleSpecific,
  };
}

/* ===================== Role auswählen ===================== */

async function chooseRoleAction(formData: FormData) {
  "use server";
  const uid = String(formData.get("uid") || "");
  const role = String(formData.get("role") || "") as Role;
  if (!uid || !["athlete", "motionExpert", "studioHost"].includes(role))
    redirect("/onboarding");

  const supa = await supabaseServerAction();
  const { error } = await supa
    .from("user_roles")
    .insert({ user_id: uid, role });
  if (error && !/duplicate key/i.test(error.message)) {
    throw new Error(error.message);
  }
  redirect("/onboarding");
}
