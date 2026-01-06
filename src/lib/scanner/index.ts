import { fetchPage, normalizeUrl } from "./fetcher";
import { extractContent } from "./extractor";
import { analyzeReadability } from "../analyzers/readability";
import { analyzeStructure } from "../analyzers/structure";
import { analyzeEntities } from "../analyzers/entities";
import { analyzeSources } from "../analyzers/sources";
import { generateInsights } from "../analyzers/insights";
import type { ScanResult, CategoryScores } from "./types";

export { FetchError } from "./fetcher";
export * from "./types";

export interface ScanOptions {
  timeout?: number;
}

export async function scanUrl(
  inputUrl: string,
  _options: ScanOptions = {}
): Promise<ScanResult> {
  // Normalize URL
  const url = normalizeUrl(inputUrl);

  // Fetch the page
  const page = await fetchPage(url);

  // Extract content
  const extraction = extractContent(page.html, page.redirectedUrl || url);

  // Run analyzers in parallel
  const [readability, structure, entities, sources] = await Promise.all([
    analyzeReadability(extraction),
    analyzeStructure(extraction),
    analyzeEntities(extraction),
    analyzeSources(extraction),
  ]);

  const scores: CategoryScores = {
    readability,
    structure,
    entities,
    sources,
  };

  // Calculate overall score (weighted average)
  const weights = {
    readability: 0.3,
    structure: 0.25,
    entities: 0.25,
    sources: 0.2,
  };

  const overallScore = Math.round(
    Object.entries(scores).reduce((acc, [key, score]) => {
      return acc + score.percentage * weights[key as keyof typeof weights];
    }, 0)
  );

  // Generate insights
  const insights = generateInsights(scores, extraction);

  return {
    url: page.redirectedUrl || url,
    title: extraction.title,
    description: extraction.description,
    content: extraction.content,
    scores,
    overallScore,
    insights,
    metadata: extraction.metadata,
    scannedAt: new Date().toISOString(),
  };
}
