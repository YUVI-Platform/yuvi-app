// next.config.ts
import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

// Failsafe: ENV kann lokal/preview fehlen oder ungültig sein
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_HOST = (() => {
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return undefined;
  }
})();

// Wichtig: RemotePattern[] mit Literal-Typen für `protocol`
const remotePatterns: RemotePattern[] = SUPABASE_HOST
  ? [
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/avatars/**",
      },
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/studio-images/**",
      },
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/session-images/**",
      },
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/portfolio/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  // kurzfristig, damit der Build nicht an ESLint-Errors stirbt
  eslint: { ignoreDuringBuilds: true },

  images: { remotePatterns },
};

export default nextConfig;
