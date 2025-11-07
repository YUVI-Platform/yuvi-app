// components/qr/QR.tsx
export function QR({ value, size = 280 }: { value: string; size?: number }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    value
  )}`;
  return (
    <img
      src={src}
      alt="QR code"
      width={size}
      height={size}
      className="rounded-lg shadow"
    />
  );
}
