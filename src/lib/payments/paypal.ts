export function normalizePaypalLink(raw: string): string {
  if (!raw) return "";
  let url = raw.trim();

  // Protokoll erzwingen
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  // paypal.com/paypalme → paypal.me vereinheitlichen
  url = url.replace(
    /https?:\/\/(www\.)?paypal\.com\/paypalme\//i,
    "https://paypal.me/"
  );

  // Trailing slash entfernen
  url = url.replace(/\/$/, "");

  // Whitelist-Domains
  const ok = /https?:\/\/(www\.)?(paypal\.me\/|paypal\.link\/).+/i.test(url);
  return ok ? url : "";
}

/** Anhängen des Betrags NUR für paypal.me-Links */
export function buildPaypalUrl(base: string, amountEUR?: number): string {
  const normalized = normalizePaypalLink(base);
  if (!normalized) return "";
  if (
    typeof amountEUR === "number" &&
    amountEUR > 0 &&
    /paypal\.me\//i.test(normalized)
  ) {
    // Dezimalpunkt verwenden (kein Komma)
    const amount = Math.round(amountEUR * 100) / 100;
    return `${normalized}/${amount.toFixed(2)}`;
  }
  return normalized;
}
