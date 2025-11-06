import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import SeatsLeftBadge from "@/app/(protected)/components/SeatsLeftBadge";
import BookButton from "@/app/(protected)/components/BookButton";
import Image from "next/image";
export default async function OccDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: occId } = await params; // ✅ Next 15: params awaiten

  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user) redirect(`/login?redirectTo=/dashboard/athlete/occ/${occId}`);

  const { data: occ, error } = await supa
    .from("session_occurrences")
    .select(
      "id, starts_at, ends_at, capacity, sessions:session_id(id, title, image_urls, price_cents)"
    )
    .eq("id", occId)
    .maybeSingle();

  if (error || !occ) {
    return (
      <div className="p-4 text-sm text-rose-600">
        Occurrence nicht gefunden.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">
        {occ.sessions?.title ?? "Session"}
      </h1>

      <div className="flex items-center gap-2">
        <SeatsLeftBadge occurrenceId={occId} />
        <span className="text-sm text-slate-600">
          {new Date(occ.starts_at).toLocaleString()}
        </span>
      </div>

      {/* Optional: Bild(er) */}
      {occ.sessions?.image_urls?.[0] && (
        <Image
          src={occ.sessions.image_urls[0] ?? ""}
          alt={occ.sessions.title ?? "Session"}
          width={600}
          height={400}
          className="w-full rounded-xl border"
        />
      )}

      {/* Preis */}
      <div className="text-base">
        Preis: {(occ.sessions?.price_cents ?? 0) / 100} €
      </div>

      {/* CTA */}
      <BookButton occurrenceId={occId} />
    </div>
  );
}
