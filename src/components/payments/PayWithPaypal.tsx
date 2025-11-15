"use client";

import * as React from "react";
import { buildPaypalUrl } from "@/lib/payments/paypal";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import QRCode, { type QRCodeToDataURLOptions } from "qrcode";
import Image from "next/image";

type Props = {
  baseLink?: string | null;
  amountEUR?: number;
  title?: string;
  showQR?: boolean;
};

export default function PayWithPaypal({
  baseLink,
  amountEUR,
  title,
  showQR = true,
}: Props) {
  const url = React.useMemo(() => {
    if (!baseLink) return "";
    return buildPaypalUrl(baseLink, amountEUR);
  }, [baseLink, amountEUR]);

  const [copied, setCopied] = React.useState(false);
  const [qrSrc, setQrSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    if (!showQR || !url) {
      setQrSrc(null);
      return;
    }

    const opts: QRCodeToDataURLOptions = {
      width: 192, // ⬅️ statt scale
      margin: 2,
      errorCorrectionLevel: "M", // optional
      type: "image/png", // optional
    };

    QRCode.toDataURL(url, opts)
      .then((data) => mounted && setQrSrc(data))
      .catch(() => mounted && setQrSrc(null));

    return () => {
      mounted = false;
    };
  }, [url, showQR]);

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!url) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            title ? `Mit PayPal zahlen für ${title}` : "Mit PayPal zahlen"
          }
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Jetzt mit PayPal zahlen
          {typeof amountEUR === "number" ? ` – ${amountEUR.toFixed(2)} €` : ""}
        </a>

        <Button
          type="button"
          variant="secondary"
          onClick={copy}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Kopiert" : "Link kopieren"}
        </Button>
      </div>

      {showQR && qrSrc ? (
        <Image
          src={qrSrc}
          alt={title ? `PayPal QR – ${title}` : "PayPal QR"}
          className="mt-2 rounded"
          width={192}
          height={192}
        />
      ) : null}

      <p className="text-xs text-slate-500">
        Zahlung erfolgt direkt über PayPal. Bitte das Fenster nicht schließen,
        bis PayPal bestätigt.
      </p>
    </div>
  );
}
