import { supabaseServerRead } from "@/lib/supabaseServer";
import PaymentsForm from "./ui/PaymentsForm";

export default async function PaymentsSettingsPage() {
  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user) return null; // ggf. redirect

  const { data: profile } = await supa
    .from("motion_expert_profiles")
    .select("paypal_link")
    .eq("user_id", me.user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Zahlungen · PayPal</h1>
      <p className="mb-6 text-sm text-slate-600">
        Hinterlege deinen PayPal‑Link (z. B. <code>paypal.me/deinname</code>).
        Auf Session-Seiten zeigen wir daraus einen Button und optional einen
        QR‑Code.
      </p>
      <PaymentsForm defaultLink={profile?.paypal_link ?? ""} />
    </main>
  );
}
