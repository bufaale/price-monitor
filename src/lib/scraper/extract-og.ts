import type { CheerioAPI } from "cheerio";

import { parsePrice } from "./parse-price";
import type { ScrapeResult } from "./types";

/**
 * Extract price from Open Graph product meta tags.
 * Looks for `<meta property="product:price:amount">` and
 * `<meta property="product:price:currency">`.
 * Falls back to og:price:amount / og:price:currency.
 */
export function extractFromOG($: CheerioAPI): ScrapeResult | null {
  // Try product:price:amount first (most common for e-commerce)
  const priceAmount =
    $('meta[property="product:price:amount"]').attr("content") ||
    $('meta[property="og:price:amount"]').attr("content");

  if (!priceAmount) return null;

  const parsed = parsePrice(priceAmount);
  if (!parsed) return null;

  // Get currency from meta tag, or use what parsePrice detected
  const currencyMeta =
    $('meta[property="product:price:currency"]').attr("content") ||
    $('meta[property="og:price:currency"]').attr("content");

  const currency = currencyMeta ? currencyMeta.toUpperCase() : parsed.currency;

  // Get product name from og:title
  const productName =
    $('meta[property="og:title"]').attr("content") || undefined;

  return {
    price: parsed.price,
    currency,
    method: "og",
    productName,
  };
}
