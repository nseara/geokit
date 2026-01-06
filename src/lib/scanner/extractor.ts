import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import * as cheerio from "cheerio";
import type { ExtractedContent, PageMetadata } from "./types";

export interface ExtractionResult {
  title: string;
  description: string | null;
  content: ExtractedContent;
  metadata: PageMetadata;
  rawHtml: string;
  $: cheerio.CheerioAPI;
}

export function extractContent(html: string, url: string): ExtractionResult {
  const $ = cheerio.load(html);

  // Extract basic metadata
  const title =
    $("title").text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("h1").first().text().trim() ||
    "Untitled";

  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    null;

  // Use Readability for main content extraction
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document, {
    charThreshold: 100,
  });
  const article = reader.parse();

  // Fallback to body content if Readability fails
  const textContent = article?.textContent || $("body").text() || "";
  const htmlContent = article?.content || $("body").html() || "";

  // Calculate word count and reading time
  const words = textContent.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;
  const readingTime = Math.ceil(wordCount / 200); // Avg 200 WPM

  const content: ExtractedContent = {
    text: textContent.trim(),
    html: htmlContent,
    wordCount,
    readingTime,
  };

  // Extract page metadata
  const metadata = extractMetadata($, url);

  return {
    title,
    description,
    content,
    metadata,
    rawHtml: html,
    $,
  };
}

function extractMetadata($: cheerio.CheerioAPI, url: string): PageMetadata {
  // Favicon
  let favicon: string | null =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="apple-touch-icon"]').attr("href") ||
    null;

  if (favicon && !favicon.startsWith("http")) {
    try {
      favicon = new URL(favicon, url).toString();
    } catch {
      favicon = null;
    }
  }

  // OG Image
  let ogImage: string | null = $('meta[property="og:image"]').attr("content") || null;
  if (ogImage && !ogImage.startsWith("http")) {
    try {
      ogImage = new URL(ogImage, url).toString();
    } catch {
      ogImage = null;
    }
  }

  // Author
  const author =
    $('meta[name="author"]').attr("content") ||
    $('meta[property="article:author"]').attr("content") ||
    $('[rel="author"]').text().trim() ||
    null;

  // Dates
  const publishDate =
    $('meta[property="article:published_time"]').attr("content") ||
    $('meta[name="publish-date"]').attr("content") ||
    $("time[datetime]").attr("datetime") ||
    null;

  const modifiedDate =
    $('meta[property="article:modified_time"]').attr("content") ||
    $('meta[name="last-modified"]').attr("content") ||
    null;

  // Language
  const language =
    $("html").attr("lang") ||
    $('meta[http-equiv="content-language"]').attr("content") ||
    null;

  // Schema.org
  const schemaScripts = $('script[type="application/ld+json"]');
  const schemaTypes: string[] = [];

  schemaScripts.each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const json = JSON.parse(content);
        const types = Array.isArray(json) ? json : [json];
        types.forEach((item) => {
          if (item["@type"]) {
            const type = Array.isArray(item["@type"])
              ? item["@type"]
              : [item["@type"]];
            schemaTypes.push(...type);
          }
        });
      }
    } catch {
      // Ignore JSON parse errors
    }
  });

  return {
    favicon,
    ogImage,
    author,
    publishDate,
    modifiedDate,
    language,
    hasSchema: schemaTypes.length > 0,
    schemaTypes: [...new Set(schemaTypes)],
  };
}

export function extractHeadings(
  $: cheerio.CheerioAPI
): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];

  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tagName = $(el).prop("tagName")?.toLowerCase() || "h1";
    const level = parseInt(tagName.replace("h", ""), 10);
    const text = $(el).text().trim();
    if (text) {
      headings.push({ level, text });
    }
  });

  return headings;
}

export function extractLists($: cheerio.CheerioAPI): {
  ordered: number;
  unordered: number;
  totalItems: number;
} {
  const ordered = $("ol").length;
  const unordered = $("ul").length;
  const totalItems = $("li").length;

  return { ordered, unordered, totalItems };
}

export function extractLinks(
  $: cheerio.CheerioAPI,
  baseUrl: string
): {
  internal: number;
  external: number;
  total: number;
} {
  let internal = 0;
  let external = 0;

  try {
    const baseHost = new URL(baseUrl).hostname;

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        return;
      }

      try {
        const linkUrl = new URL(href, baseUrl);
        if (linkUrl.hostname === baseHost) {
          internal++;
        } else {
          external++;
        }
      } catch {
        // Malformed URL, count as internal
        internal++;
      }
    });
  } catch {
    // Invalid base URL
  }

  return { internal, external, total: internal + external };
}

export function extractImages($: cheerio.CheerioAPI): {
  total: number;
  withAlt: number;
  withoutAlt: number;
} {
  let withAlt = 0;
  let withoutAlt = 0;

  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt && alt.trim().length > 0) {
      withAlt++;
    } else {
      withoutAlt++;
    }
  });

  return {
    total: withAlt + withoutAlt,
    withAlt,
    withoutAlt,
  };
}
