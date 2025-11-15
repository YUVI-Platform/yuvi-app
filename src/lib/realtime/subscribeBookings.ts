// src/lib/realtime/subscribeBookings.ts
import { supabase } from "@/lib/supabaseBrowser";

type Handler = (evt: "INSERT" | "UPDATE" | "DELETE", row: any) => void;

export function subscribeBookingsByOccurrence(
  occId: string,
  onChange: Handler
): () => void {
  const channel = supabase
    .channel(`occ-${occId}-bookings`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bookings",
        filter: `occurrence_id=eq.${occId}`,
      },
      (payload) => {
        const evt = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
        const row = evt === "DELETE" ? payload.old : payload.new;
        onChange(evt, row);
      }
    )
    .subscribe((status) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[realtime] bookings", occId, status);
      }
    });

  // Wichtig: Cleanup muss `void` sein – Promise NICHT zurückgeben
  return () => {
    // Variante A
    void supabase.removeChannel(channel);
    // oder Variante B:
    // channel.unsubscribe().catch(() => {});
  };
}
