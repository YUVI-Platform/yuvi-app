// lib/supabaseServer.ts
import { cookies, headers } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Nur LESEN (Server Components / Pages) */
export async function supabaseServerRead() {
  const store = await cookies(); // <-- WICHTIG: await
  return createServerClient(url, anon, {
    cookies: {
      // Neue API
      getAll() {
        return store.getAll();
      },
      setAll() {
        /* no-op in RSC */
      },
      // Legacy API (wird von manchen @supabase/ssr-Versionen noch genutzt)
      get(name: string) {
        return store.get(name)?.value;
      },
      set(_name: string, _value: string, _options?: CookieOptions) {
        /* no-op in RSC */
      },
      remove(_name: string, _options?: CookieOptions) {
        /* no-op in RSC */
      },
    },
  });
}

/** LESEN + SCHREIBEN (nur in Server Actions / Route Handlern) */
export async function supabaseServerAction() {
  const store = await cookies(); // <-- WICHTIG: await
  return createServerClient(url, anon, {
    cookies: {
      // Neue API
      getAll() {
        return store.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[]
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          store.set({ name, value, ...options });
        });
      },
      // Legacy API
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        store.set({ name, value, ...(options || {}) });
      },
      remove(name: string, options?: CookieOptions) {
        store.set({ name, value: "", ...(options || {}) });
      },
    },
  });
}

export async function absoluteUrl(path = "/") {
  const h = await headers();
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`
  ).replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
