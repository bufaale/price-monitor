import type { CheerioAPI } from "cheerio";

import { parsePrice } from "./parse-price";
import type { ScrapeResult } from "./types";

/**
 * Extract price using a user-provided CSS selector.
 * Gets text content from the matched element and parses it.
 * Falls back to h1 or og:title for product name.
 */
export function extractFromSelector(
  $: CheerioAPI,
  selector: string,
): ScrapeResult | null {
  const element = $(selector).first();
  if (!element.length) return null;

  const text = element.text().trim();
  if (!text) return null;

  const parsed = parsePrice(text);
  if (!parsed) return null;

  // Try to get product name from h1 or og:title
  const productName =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    undefined;

  return {
    price: parsed.price,
    currency: parsed.currency,
    method: "selector",
    productName: productName || undefined,
  };
}
