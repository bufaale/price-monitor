import * as cheerio from "cheerio";

import { extractFromJsonLd } from "./extract-jsonld";
import { extractFromOG } from "./extract-og";
import { extractFromSelector } from "./extract-selector";
import { fetchPage } from "./fetch-page";
import type { ScrapeError, ScrapeResult } from "./types";

type ScrapeSuccess = { success: true; data: ScrapeResult };
type ScrapeFailure = { success: false; error: ScrapeError };
export type ScrapeResponse = ScrapeSuccess | ScrapeFailure;

/**
 * Main entry point for the price scraping pipeline.
 *
 * Strategy order:
 * 1. JSON-LD structured data (`<script type="application/ld+json">`)
 * 2. Open Graph meta tags (`product:price:amount`)
 * 3. User-provided CSS selector (optional)
 *
 * Returns the first successful extraction or an error.
 */
export async function scrapeProduct(
  url: string,
  cssSelector?: string,
): Promise<ScrapeResponse> {
  // 1. Validate URL
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith("http")) {
      return {
        success: false,
        error: {
          code: "INVALID_URL",
          message: `Invalid protocol: ${parsed.protocol}. Only HTTP/HTTPS URLs are supported.`,
        },
      };
    }
  } catch {
    return {
      success: false,
      error: {
        code: "INVALID_URL",
        message: `Invalid URL: ${url}`,
      },
    };
  }

  // 2. Fetch HTML
  let html: string;
  try {
    html = await fetchPage(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("abort") || message.includes("AbortError")) {
      return {
        success: false,
        error: {
          code: "TIMEOUT",
          message: `Request timed out after 15 seconds: ${url}`,
        },
      };
    }

    if (message.includes("Page too large")) {
      return {
        success: false,
        error: {
          code: "HTML_TOO_LARGE",
          message,
        },
      };
    }

    return {
      success: false,
      error: {
        code: "FETCH_FAILED",
        message: `Failed to fetch page: ${message}`,
      },
    };
  }

  // 3. Parse HTML with cheerio
  const $ = cheerio.load(html);

  // 4. Try JSON-LD extraction (highest fidelity)
  const jsonLdResult = extractFromJsonLd($);
  if (jsonLdResult) {
    return { success: true, data: jsonLdResult };
  }

  // 5. Try Open Graph extraction
  const ogResult = extractFromOG($);
  if (ogResult) {
    return { success: true, data: ogResult };
  }

  // 6. Try CSS selector extraction (if provided)
  if (cssSelector) {
    const selectorResult = extractFromSelector($, cssSelector);
    if (selectorResult) {
      return { success: true, data: selectorResult };
    }
  }

  // 7. Nothing worked
  return {
    success: false,
    error: {
      code: "NO_PRICE_FOUND",
      message: `Could not extract price from ${url}. Try providing a CSS selector for the price element.`,
    },
  };
}
