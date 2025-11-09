"use client";

import SessionCard from "./SessionCard";

type OccurrenceWithDecor = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity?: number | null;
  sessions?: {
    id: string;
    title: string | null;
    image_urls?: string[] | null;
    session_type?: string | null;
    price_cents?: number | null;
    tags?: string[] | null;
    location_type?: string | null;
  } | null;
  studio_slots?: {
    id: string;
    capacity?: number | null;
    studio_locations?: {
      id: string;
      title?: string | null;
      address?: Record<string, unknown> | null;
      image_urls?: string[] | null;
      max_participants?: number | null;
    } | null;
  } | null;

  // vom Server dekoriert:
  initialBookingId: string | null;
};

export default function DashboardClient({
  myOccurrences,
  recommended,
}: {
  myOccurrences: OccurrenceWithDecor[];
  recommended: OccurrenceWithDecor[];
}) {
  const path = "/dashboard/athlete";

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Meine kommenden Sessions</h2>
        <div className="grid grid-cols-1 gap-4 ">
          {myOccurrences.map((occ) => (
            <SessionCard
              key={occ.id}
              occurrence={occ}
              initialBookingId={occ.initialBookingId}
              path={path}
              detailsHref={`/dashboard/athlete/occ/${occ.id}`}
              highlight
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Empfohlen</h2>
        <div className="grid grid-cols-1 ">
          {recommended.map((occ) => (
            <SessionCard
              key={occ.id}
              occurrence={occ}
              initialBookingId={occ.initialBookingId}
              path={path}
              detailsHref={`/dashboard/athlete/occ/${occ.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
