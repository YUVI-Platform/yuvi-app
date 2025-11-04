// lib/supabaseBrowser.ts
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Singleton (für einfache, zentrale Verwendung)
export const supabase = createBrowserClient(url, anon);

// ✅ Funktion (für frische Instanzen z. B. bei Uploads)
export function supabaseBrowser() {
  return createBrowserClient(url, anon);
}
