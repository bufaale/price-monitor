export interface ScrapeResult {
  price: number;
  currency: string;
  method: "json-ld" | "og" | "selector";
  productName?: string;
}

export interface ScrapeError {
  code:
    | "FETCH_FAILED"
    | "NO_PRICE_FOUND"
    | "INVALID_URL"
    | "TIMEOUT"
    | "HTML_TOO_LARGE";
  message: string;
}
