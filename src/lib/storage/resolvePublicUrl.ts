// src/lib/storage/resolvePublicUrl.ts
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export function resolvePublicUrl(raw?: string | null): string | null {
  if (!raw) return null;

  // bereits absolut
  if (/^https?:\/\//i.test(raw)) return raw;

  // /storage/... oder storage/... -> mit Projekt-URL prefixen
  if (raw.startsWith("/storage/")) return `${BASE}${raw}`;
  if (raw.startsWith("storage/")) return `${BASE}/${raw}`;

  // public/<bucket>/<key>  oder  object/public/<bucket>/<key>
  const mPublic = raw.match(/^(?:object\/)?public\/([^/]+)\/(.+)$/);
  if (mPublic) {
    const [, bucket, key] = mPublic;
    return `${BASE}/storage/v1/object/public/${bucket}/${key}`;
  }

  // <bucket>/<key> (häufigster Fall: "avatars/uid/xyz.jpg")
  const mBucketKey = raw.match(/^([^/]+)\/(.+)$/);
  if (mBucketKey) {
    const [, bucket, key] = mBucketKey;
    return `${BASE}/storage/v1/object/public/${bucket}/${key}`;
  }

  // Fallback: unbekanntes Format
  return null;
}
