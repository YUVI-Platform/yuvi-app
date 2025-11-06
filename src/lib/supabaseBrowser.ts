// lib/supabaseBrowser.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ⚠️ In Client Components verwenden.
// In Server Code stattdessen supabaseServerRead/supabaseServerAction nutzen.
export const supabase: SupabaseClient<Database> = createBrowserClient<Database>(
  url,
  anon
);

// Frische Instanz (z. B. für Upload-Workflows)
export function supabaseBrowser(): SupabaseClient<Database> {
  return createBrowserClient<Database>(url, anon);
}
