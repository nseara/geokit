import type { FetchedPage } from "./types";

const USER_AGENT =
  "Mozilla/5.0 (compatible; GeoKitBot/1.0; +https://geokit.dev/bot)";

const TIMEOUT_MS = 10000;

export class FetchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public url?: string
  ) {
    super(message);
    this.name = "FetchError";
  }
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new FetchError(
        `Failed to fetch page: ${response.statusText}`,
        response.status,
        url
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new FetchError(
        "URL does not return HTML content",
        response.status,
        url
      );
    }

    const html = await response.text();

    // Convert headers to plain object
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      url,
      html,
      statusCode: response.status,
      headers,
      redirectedUrl: response.url !== url ? response.url : undefined,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof FetchError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new FetchError("Request timed out", undefined, url);
      }
      throw new FetchError(`Failed to fetch: ${error.message}`, undefined, url);
    }

    throw new FetchError("Unknown error occurred", undefined, url);
  }
}

export function normalizeUrl(input: string): string {
  let url = input.trim();

  // Add https:// if no protocol
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Parse and normalize
  const parsed = new URL(url);

  // Remove trailing slash for consistency
  let normalized = parsed.toString();
  if (normalized.endsWith("/") && parsed.pathname === "/") {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

export function isValidUrl(input: string): boolean {
  try {
    const url = normalizeUrl(input);
    const parsed = new URL(url);
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
}
