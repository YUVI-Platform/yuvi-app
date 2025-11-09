// app/(protected)/dashboard/athlete/occ/[id]/page.tsx
import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import SeatsLeftBadge from "@/app/(protected)/components/SeatsLeftBadge";
import BookButton from "@/app/(protected)/components/BookButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Enums, Tables } from "@/types/supabase";

type Params = Promise<{ id: string }>;
type BookingLite = Pick<
  Tables<"bookings">,
  "id" | "status" | "payment" | "checked_in_at"
>;

export default async function OccDetailPage({ params }: { params: Params }) {
  const { id: occId } = await params;

  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  if (!me?.user) redirect(`/login?redirectTo=/dashboard/athlete/occ/${occId}`);

  // Occurrence + Session
  const { data: occ, error } = await supa
    .from("session_occurrences")
    .select(
      `
      id, starts_at, ends_at, capacity,
      sessions:session_id (
        id, title, image_urls, price_cents
      )
    `
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

  // Eigene aktive Buchung inkl. payment + checked_in_at
  const { data: rawBooking } = await supa
    .from("bookings")
    .select("id, status, payment, checked_in_at")
    .eq("occurrence_id", occId)
    .eq("athlete_user_id", me.user.id)
    .maybeSingle<BookingLite>();

  const myBooking: BookingLite | null =
    rawBooking &&
    !(
      ["cancelled", "completed", "no_show"] as Enums<"booking_status">[]
    ).includes(rawBooking.status)
      ? rawBooking
      : null;

  const starts = new Date(occ.starts_at).toLocaleString();
  const img = occ.sessions?.image_urls?.[0];
  const path = `/dashboard/athlete/occ/${occId}`;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">
            {occ.sessions?.title ?? "Session"}
          </h1>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <SeatsLeftBadge occurrenceId={occId} />
            <span>{starts}</span>
            {typeof occ.sessions?.price_cents === "number" && (
              <span>
                {(occ.sessions.price_cents / 100).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={occ.sessions?.title ?? "Session"}
              className="w-full rounded-xl"
            />
          )}

          <div>
            <BookButton occurrenceId={occId} booking={myBooking} path={path} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
