// src/lib/supabaseServer.ts
import { cookies, headers } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * READ-Client (Server Components / Pages)
 * - nutzt getAll/setAll (SSR-API)
 * - setAll ist in RSC ein No-Op (catch)
 */
export async function supabaseServerRead() {
  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In RSC sind Cookie-Schreibzugriffe nicht erlaubt -> still zulassen
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions);
          });
        } catch {
          /* no-op in RSC */
        }
      },
    },
  });
}

/**
 * WRITE-Client (Server Actions / Route Handler)
 * - hier darf setAll schreiben
 */
export async function supabaseServerAction() {
  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as CookieOptions);
        });
      },
    },
  });
}

/**
 * Absolute URL ermitteln (für Redirects etc.)
 */
export async function absoluteUrl(path = "/") {
  const h = await headers();
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`
  ).replace(/\/+$/, "");

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
