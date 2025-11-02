import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import OnboardingForm from "./ui/OnboardingForm";

export default async function OnboardingPage() {
  const supa = await supabaseServerRead();

  const [{ data: userRes }, { data: profile }] = await Promise.all([
    supa.auth.getUser(),
    supa
      .from("profiles")
      .select("name, alias, avatar_url, onboarding_done")
      .maybeSingle(),
  ]);

  const user = userRes.user;
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/onboarding")}`);
  }

  // Wenn schon fertig → zurück ins Dashboard
  if (profile?.onboarding_done) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-xl p-6 min-h-screen flex flex-col justify-center">
      <h1 className="mb-4 text-2xl font-semibold">Profil vervollständigen</h1>
      <p className="mb-6 text-sm text-slate-600">
        Erzähl uns kurz etwas über dich, damit andere dich finden.
      </p>
      <OnboardingForm
        defaultValues={{
          name: profile?.name ?? "",
          alias: profile?.alias ?? "",
          avatar_url: (profile as any)?.avatar_url ?? "",
        }}
      />
    </main>
  );
}
