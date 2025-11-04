// src/types/qrcode.d.ts
declare module "qrcode" {
  export type QRCodeErrorCorrectionLevel = "L" | "M" | "Q" | "H";

  export interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
    type?: "image/png" | "image/jpeg" | "image/webp";
    quality?: number;
    margin?: number;
    width?: number;
    color?: { dark?: string; light?: string };
  }

  export function toDataURL(
    text: string | Uint8Array,
    options?: QRCodeToDataURLOptions
  ): Promise<string>;

  const _default: { toDataURL: typeof toDataURL };
  export default _default;
}
