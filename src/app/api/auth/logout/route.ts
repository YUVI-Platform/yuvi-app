import { NextResponse } from "next/server";
// defaults to the global scope
import { superbase } from "@/utils/supabase/superbaseClient";
await superbase.auth.signOut();
// sign out from the current session only
export async function POST() {
  await superbase.auth.signOut();
  return NextResponse.json({ success: true });
}

//TODO: rename all to supabase from superbase
