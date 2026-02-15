import type { CheerioAPI } from "cheerio";

import { parsePrice } from "./parse-price";
import type { ScrapeResult } from "./types";

/**
 * Extract price from JSON-LD structured data.
 * Looks for `<script type="application/ld+json">` with @type "Product"
 * containing offers.price or offers.lowPrice.
 * Handles @graph arrays and nested structures.
 */
export function extractFromJsonLd($: CheerioAPI): ScrapeResult | null {
  const scripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < scripts.length; i++) {
    const raw = $(scripts[i]).html();
    if (!raw) continue;

    try {
      const data: unknown = JSON.parse(raw);
      const result = findProductInJsonLd(data);
      if (result) return result;
    } catch {
      // Invalid JSON — skip this script tag
      continue;
    }
  }

  return null;
}

function findProductInJsonLd(data: unknown): ScrapeResult | null {
  if (!data || typeof data !== "object") return null;

  // Handle @graph arrays (common in WordPress/WooCommerce)
  if (Array.isArray(data)) {
    for (const item of data) {
      const result = findProductInJsonLd(item);
      if (result) return result;
    }
    return null;
  }

  const obj = data as Record<string, unknown>;

  // Handle @graph property
  if (Array.isArray(obj["@graph"])) {
    for (const item of obj["@graph"]) {
      const result = findProductInJsonLd(item);
      if (result) return result;
    }
  }

  // Check if this is a Product
  const type = obj["@type"];
  if (!isProductType(type)) return null;

  const productName =
    typeof obj["name"] === "string" ? obj["name"] : undefined;

  // Extract price from offers
  const offers = obj["offers"];
  if (!offers) return null;

  const priceResult = extractPriceFromOffers(offers);
  if (!priceResult) return null;

  return {
    price: priceResult.price,
    currency: priceResult.currency,
    method: "json-ld",
    productName,
  };
}

function isProductType(type: unknown): boolean {
  if (typeof type === "string") {
    return type === "Product" || type === "https://schema.org/Product";
  }
  if (Array.isArray(type)) {
    return type.some(
      (t) => t === "Product" || t === "https://schema.org/Product",
    );
  }
  return false;
}

function extractPriceFromOffers(
  offers: unknown,
): { price: number; currency: string } | null {
  if (Array.isArray(offers)) {
    // Multiple offers — use the first one with a valid price
    for (const offer of offers) {
      const result = extractPriceFromOffers(offer);
      if (result) return result;
    }
    return null;
  }

  if (!offers || typeof offers !== "object") return null;
  const offer = offers as Record<string, unknown>;

  // AggregateOffer: use lowPrice
  const offerType = offer["@type"];
  if (
    offerType === "AggregateOffer" ||
    offerType === "https://schema.org/AggregateOffer"
  ) {
    const lowPrice = offer["lowPrice"];
    if (lowPrice !== undefined) {
      const currency =
        typeof offer["priceCurrency"] === "string"
          ? offer["priceCurrency"]
          : "USD";
      const parsed = parsePrice(String(lowPrice));
      if (parsed) return { price: parsed.price, currency };
    }
  }

  // Standard Offer: use price
  const price = offer["price"];
  if (price !== undefined) {
    const currency =
      typeof offer["priceCurrency"] === "string"
        ? offer["priceCurrency"]
        : "USD";
    const parsed = parsePrice(String(price));
    if (parsed) return { price: parsed.price, currency };
  }

  return null;
}
