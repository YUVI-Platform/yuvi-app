"use server";

import { supabaseServerAction } from "@/lib/supabaseServer";

export async function athleteCheckinAction(occurrenceId: string, code: string) {
  if (!code) throw new Error("Kein Code übergeben.");
  const supa = await supabaseServerAction();

  // Der eingeloggte Athlete wird automatisch via Cookies/Session erkannt
  const { data, error } = await supa.rpc("checkin_with_code", {
    p_occurrence: occurrenceId,
    p_code: code,
  });

  if (error) throw new Error(error.message);
  if (!data)
    throw new Error("Check-in fehlgeschlagen (ungültiger/abgelaufener Code).");
  return true;
}
