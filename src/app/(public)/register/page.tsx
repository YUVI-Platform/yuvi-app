import { redirect } from "next/navigation";
import { validateInvite, finalizeInviteAtomic } from "./actions";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrieren | YUVI",
  description:
    "Erstelle deinen YUVI-Account und buche Sessions oder finde Studios in deiner Nähe.",
  alternates: { canonical: "/register" },

  openGraph: {
    title: "YUVI – Jetzt registrieren",
    description:
      "Werde Teil der YUVI Community: buche Bewegungssessions, entdecke Studios und starte noch heute.",
    url: "/register",
    siteName: "YUVI",
    images: [
      {
        url: "/hero-section-runner-dummy.jpg",
        width: 1200,
        height: 630,
        alt: "YUVI Registrierung – Werde Teil der Community",
      },
    ],
    locale: "de_DE",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "YUVI – Jetzt registrieren",
    description:
      "Account anlegen, Sessions buchen, Studios entdecken – los geht’s.",
    images: ["/og/yuvi-register.png"],
  },

  robots: { index: true, follow: true },
};

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
    <main className="min-h-[100svh] grid md:grid-cols-2 bg-background">
      {/* Right: Form (mobile-first Card, zentriert, eigener Scroll) */}
      <section className="min-h-0 flex flex-col">
        {/* Mobile-Header */}
        <div className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="px-4 py-3">
            <h2 className="text-lg font-semibold">Create your account</h2>
          </div>
        </div>

        {/* Scrollbarer Bereich, zentrierter Card-Form */}
        <div className="min-h-0 flex-1 overflow-y-auto mt-40">
          <div className="mx-auto w-full max-w-md px-4 md:px-8 py-8 md:py-14">
            <div className="rounded-2xl border bg-white p-6 shadow-sm md:shadow">
              {/* Brand (nur Mobile im Card-Header sichtbar) */}
              <div className="md:hidden mb-4">
                <h1 className="text-4xl font-semibold font-fancy text-yuvi-rose">
                  YUVi
                </h1>
              </div>

              <h2 className="hidden md:block text-3xl font-semibold font-fancy text-yuvi-rose">
                CREATE YOUR ACCOUNT
              </h2>

              <form action={action} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-yuvi-skyblue/60"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-yuvi-skyblue/60"
                    placeholder="min. 8 characters"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full text-base md:text-lg rounded-md bg-yuvi-skyblue hover:bg-yuvi-skyblue-dark font-fancy px-4 py-2.5 text-white transition"
                >
                  {"Create account".toUpperCase()}
                </button>

                <p className="text-xs md:text-sm text-muted-foreground">
                  Invite code: <code className="text-slate-700">{code}</code>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile-Safe-Area Spacer */}
        <div
          className="md:hidden"
          style={{ height: "calc(env(safe-area-inset-bottom))" }}
        />
      </section>
    </main>
  );
}
