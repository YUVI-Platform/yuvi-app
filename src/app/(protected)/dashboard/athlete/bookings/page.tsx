// app/(protected)/dashboard/athlete/bookings/page.tsx
import { redirect } from "next/navigation";
import { supabaseServerRead } from "@/lib/supabaseServer";
import BookingsClient from "./BookingClient";
import { cancelBookingAction } from "./actions";

export default async function AthleteBookingsPage() {
  const supa = await supabaseServerRead();
  const { data: me } = await supa.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) {
    redirect("/login?redirectTo=/dashboard/athlete/bookings");
  }

  // Buchungen des eingeloggten Athleten + Occurrence + Session
  const { data, error } = await supa
    .from("bookings")
    .select(
      `
      id, status, payment, checkin_code, created_at,
      occurrence:session_occurrences!bookings_occurrence_id_fkey(
        id, starts_at, ends_at, capacity,
        session:sessions!session_occurrences_session_id_fkey(
          id, title, image_urls, price_cents
        )
      )
    `
    )
    .eq("athlete_user_id", uid)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-4 text-sm text-rose-600">
        Konnte Buchungen nicht laden: {error.message}
      </div>
    );
  }

  // Daten an Client-Komponente übergeben (inkl. Server Action für Form)
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Meine Buchungen</h1>
      <BookingsClient
        bookings={data ?? []}
        cancelAction={cancelBookingAction}
      />
    </div>
  );
}
