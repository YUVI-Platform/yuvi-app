// src/components/ui/AvatarImage.tsx
"use client";
import Image from "next/image";
import { useMemo, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_HOST = BASE ? new URL(BASE).hostname : "";

// Optional: weitere häufige Avatar-Hosts erlauben
const DEFAULT_ALLOWED = new Set([
  SUPABASE_HOST,
  "lh3.googleusercontent.com",
  "images.unsplash.com",
  "avatars.githubusercontent.com",
  "media.licdn.com",
]);

function resolvePublicUrl(raw?: string | null): string | null {
  if (!raw) return null;
  if (/^(data|blob):/i.test(raw)) return raw; // Data/Blob durchlassen
  if (/^https?:\/\//i.test(raw)) return raw; // bereits absolut

  // /storage/... oder storage/... -> mit Projekt-URL prefixen
  if (raw.startsWith("/storage/")) return `${BASE}${raw}`;
  if (raw.startsWith("storage/")) return `${BASE}/${raw}`;

  // object/public/<bucket>/<key> ODER public/<bucket>/<key>
  const mPublic = raw.match(/^(?:object\/)?public\/([^/]+)\/(.+)$/);
  if (mPublic) {
    const [, bucket, key] = mPublic;
    return `${BASE}/storage/v1/object/public/${bucket}/${key}`;
  }

  // <bucket>/<key>
  const mBucketKey = raw.match(/^([^/]+)\/(.+)$/);
  if (mBucketKey) {
    const [, bucket, key] = mBucketKey;
    return `${BASE}/storage/v1/object/public/${bucket}/${key}`;
  }

  return null;
}

type Props = {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  unoptimized?: boolean; // optional override
};

export default function AvatarImage({
  src,
  alt = "Avatar",
  size = 64,
  className = "",
  unoptimized = false,
}: Props) {
  const [broken, setBroken] = useState(false);
  const resolved = useMemo(() => resolvePublicUrl(src), [src]);

  // Host bestimmen
  let host = "";
  try {
    if (resolved && /^https?:\/\//i.test(resolved)) {
      host = new URL(resolved).hostname;
    }
  } catch {}

  const isDataOrBlob = !!resolved && /^(data|blob):/i.test(resolved);
  const allowedHost = host && DEFAULT_ALLOWED.has(host);
  const shouldUnopt = isDataOrBlob || (!!host && !allowedHost);

  const finalSrc = !broken && resolved ? resolved : "/avatar.png";

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={() => setBroken(true)}
      unoptimized={unoptimized || shouldUnopt}
      sizes={`${size}px`}
    />
  );
}
