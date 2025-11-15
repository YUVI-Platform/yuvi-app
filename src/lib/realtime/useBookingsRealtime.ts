// src/lib/realtime/useBookingsRealtime.ts
import * as React from "react";
import { subscribeBookingsByOccurrence } from "./subscribeBookings";

export function useBookingsRealtime(
  occId: string,
  onChange: (evt: "INSERT" | "UPDATE" | "DELETE", row: any) => void
) {
  React.useEffect(() => {
    if (!occId) return;
    return subscribeBookingsByOccurrence(occId, onChange); // <- liefert () => void
  }, [occId, onChange]);
}
