// lib/supabaseAdmin.ts
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!url || !serviceKey) {
  throw new Error(
    "Supabase env missing: check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
}

// ⚠️ Niemals in Client Code importieren (enthält Service Role Key)!
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  url,
  serviceKey,
  { auth: { persistSession: false } }
);
