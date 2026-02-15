const CURRENCY_MAP: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₹": "INR",
  "R$": "BRL",
  "C$": "CAD",
  "A$": "AUD",
  kr: "SEK",
  "zł": "PLN",
};

export function parsePrice(
  raw: string,
): { price: number; currency: string } | null {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.trim();

  // Detect currency from symbol
  let currency = "USD";
  for (const [symbol, code] of Object.entries(CURRENCY_MAP)) {
    if (cleaned.includes(symbol)) {
      currency = code;
      break;
    }
  }

  // Strip everything except digits, commas, and dots
  let numStr = cleaned.replace(/[^0-9.,]/g, "");

  // Handle European format: 1.234,56 → 1234.56
  if (numStr.includes(",") && numStr.includes(".")) {
    const lastComma = numStr.lastIndexOf(",");
    const lastDot = numStr.lastIndexOf(".");
    if (lastComma > lastDot) {
      // European: dots are thousands, comma is decimal
      numStr = numStr.replace(/\./g, "").replace(",", ".");
    } else {
      // US: commas are thousands, dot is decimal
      numStr = numStr.replace(/,/g, "");
    }
  } else if (numStr.includes(",")) {
    const parts = numStr.split(",");
    if (parts[parts.length - 1].length === 2) {
      // Likely decimal comma: 29,99 → 29.99
      numStr = numStr.replace(",", ".");
    } else {
      // Likely thousands comma: 1,234 → 1234
      numStr = numStr.replace(/,/g, "");
    }
  }

  const price = parseFloat(numStr);
  if (isNaN(price) || price <= 0) return null;
  return { price: Math.round(price * 100) / 100, currency };
}
