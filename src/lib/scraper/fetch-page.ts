import { getRandomUserAgent } from "./user-agents";

const MAX_HTML_SIZE = 2 * 1024 * 1024; // 2MB

export async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml")
    ) {
      throw new Error(`Not an HTML page: ${contentType}`);
    }

    const html = await response.text();
    if (html.length > MAX_HTML_SIZE) {
      throw new Error(
        `Page too large: ${(html.length / 1024 / 1024).toFixed(1)}MB`,
      );
    }

    return html;
  } finally {
    clearTimeout(timeout);
  }
}
