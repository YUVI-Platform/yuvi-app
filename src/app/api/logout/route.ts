// src/app/api/logout/route.ts
import { NextResponse } from "next/server";
import { superbase } from "@/utils/supabase/superbaseClient";

export async function POST() {
  await superbase.auth.signOut(); // Nur hier aufrufen – im Scope der Funktion
  return NextResponse.json({ success: true });
}
