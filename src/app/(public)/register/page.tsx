import { redirect } from "next/navigation";
import { validateInvite, finalizeInviteAtomic } from "./actions";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SP = Promise<{ [k: string]: string | string[] | undefined }>;

export default async function Register({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  // 1) robust auslesen
  const rawCode = Array.isArray(sp.code) ? sp.code[0] : sp.code;
  if (!rawCode) redirect("/");

  // 2) jetzt *definitiv* string
  const code: string = rawCode;

  const check = await validateInvite(code);
  if (!check?.ok) redirect("/login?error=Invite%20invalid");

  async function action(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    if (!email || !password) throw new Error("Missing credentials");

    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    let userId = created.data?.user?.id ?? null;

    if (!userId && created.error) {
      const msg = created.error.message.toLowerCase();
      if (
        msg.includes("already been registered") ||
        msg.includes("already registered")
      ) {
        const supabase = await supabaseServerAction();
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) {
          redirect(
            `/login?error=${encodeURIComponent(
              "Konto existiert bereits. Bitte anmelden."
            )}&redirectTo=${encodeURIComponent(`/register?code=${code}`)}`
          );
        }
        const { data: me } = await supabase.auth.getUser();
        userId = me?.user?.id ?? null;
      } else {
        throw new Error(created.error.message);
      }
    }

    if (!userId) throw new Error("Kein Benutzerkonto verfügbar.");

    // <- hier nach dem Guard hart als string behandeln
    await finalizeInviteAtomic({ code, user_id: userId!, email });

    const supabase = await supabaseServerAction();
    const { data: me2 } = await supabase.auth.getUser();
    if (!me2?.user) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr)
        redirect(`/login?error=${encodeURIComponent(signInErr.message)}`);
    }

    redirect("/onboarding");
  }

  return (
    <main className="flex w-full h-svh max-h-screen justify-center items-center">
      <form action={action} className="w-full mx-auto mt-10 max-w-md space-y-4">
        <h1 className="text-4xl font-semibold font-fancy text-yuvi-rose">
          CREATE YOUR ACCOUNT
        </h1>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-md border px-3 py-2"
            placeholder="min. 8 characters"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-yuvi-rose px-4 py-2 text-white"
        >
          Create account
        </button>

        <p className="text-sm text-muted-foreground">
          Invite code: <code>{code}</code>
        </p>
      </form>
    </main>
  );
}
