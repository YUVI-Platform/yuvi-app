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
  specialties?: string[];
  portfolio_url?: string;
  bio?: string;
  paypal_link?: string;
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
    <main className="min-h-[100svh] grid grid-rows-[auto_1fr_auto] bg-background">
      {/* Sticky header (mobile app-like) */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Onboarding</h1>
          <span className="text-xs text-slate-500">
            Rolle: <b>{roleLabel(role)}</b>
          </span>
        </div>
      </header>

      {/* Scroll container */}
      <section className="min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-md px-4 py-6">
          <OnboardingForm
            role={role}
            defaultValues={defaultValues.profile}
            uid={uid}
          >
            {renderRoleFields(role, defaultValues.roleSpecific)}
          </OnboardingForm>
        </div>
      </section>

      {/* Safe-area padding for iOS home indicator */}
      <div className="h-[calc(env(safe-area-inset-bottom))]" />
    </main>
  );
}

/* ===================== Hilfskomponenten & Helpers ===================== */

function ChooseRoleForm({ uid }: { uid: string }) {
  return (
    <main className="min-h-[100svh] grid grid-rows-[auto_1fr]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold">Wähle deine Rolle</h1>
        </div>
      </header>
      <section className="min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-md px-4 py-6">
          <form
            action={chooseRoleAction}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <input type="hidden" name="uid" value={uid} />
            <div className="space-y-3">
              {["athlete", "motionExpert", "studioHost"].map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2"
                >
                  <input type="radio" name="role" value={role} required />
                  <span className="text-sm">{roleLabel(role as Role)}</span>
                </label>
              ))}
            </div>
            <button className="mt-6 w-full rounded-md bg-black px-4 py-2 text-white">
              Weiter
            </button>
          </form>
        </div>
      </section>
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
