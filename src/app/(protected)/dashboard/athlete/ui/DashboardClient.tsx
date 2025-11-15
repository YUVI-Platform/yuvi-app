"use client";

import SessionCard from "./SessionCard";

type Occ = {
  id: string;
  starts_at: string;
  ends_at: string;
  capacity: number | null;
  booked_count: number | null;
  sessions: {
    id: string;
    title: string | null;
    image_urls: string[] | null;
    session_type: string | null;
    price_cents: number | null;
    tags: string[] | null;
    location_type: string | null;
    expert?: {
      name: string | null;
      avatar_url?: string | null;
      rating_avg?: number | null;
      rating_count?: number | null;
    } | null;
  } | null;
  studio_slots?: any;
  initialBookingId: string | null;
};

export default function DashboardClient({
  myOccurrences,
  recommended,
}: {
  myOccurrences: Occ[];
  recommended: Occ[];
}) {
  const available = recommended;

  return (
    <div className="space-y-8">
      {myOccurrences?.length ? (
        <section className="mt-6 bg-slate-100 p-4 rounded-lg shadow-sm">
          <h2 className="mb-3 text-xl font-semibold tracking-wider text-yuvi-skyblue font-fancy">
            {"MEINE BUCHUNGEN"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myOccurrences.map((occ) => (
              <SessionCard
                key={occ.id}
                occurrence={occ}
                initialBookingId={occ.initialBookingId}
                path="/dashboard/athlete"
                detailsHref={`/dashboard/athlete/occ/${occ.id}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      <hr />

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-wider text-yuvi-skyblue font-fancy">
          {"VERFÜGBARE SESSIONS"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((occ) => (
            <SessionCard
              key={occ.id}
              occurrence={occ}
              initialBookingId={occ.initialBookingId}
              path="/dashboard/athlete"
              detailsHref={`/dashboard/athlete/occ/${occ.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
