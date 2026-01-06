export interface ScanResult {
  url: string;
  title: string;
  description: string | null;
  content: ExtractedContent;
  scores: CategoryScores;
  overallScore: number;
  insights: Insight[];
  metadata: PageMetadata;
  scannedAt: string;
}

export interface ExtractedContent {
  text: string;
  html: string;
  wordCount: number;
  readingTime: number;
}

export interface CategoryScores {
  readability: ScoreDetail;
  structure: ScoreDetail;
  entities: ScoreDetail;
  sources: ScoreDetail;
}

export interface ScoreDetail {
  score: number;
  maxScore: number;
  percentage: number;
  label: string;
  description: string;
  factors: ScoreFactor[];
}

export interface ScoreFactor {
  name: string;
  value: number | string | boolean;
  impact: "positive" | "negative" | "neutral";
  suggestion?: string;
}

export interface Insight {
  type: "improvement" | "warning" | "success";
  category: keyof CategoryScores;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  action?: string;
}

export interface PageMetadata {
  favicon: string | null;
  ogImage: string | null;
  author: string | null;
  publishDate: string | null;
  modifiedDate: string | null;
  language: string | null;
  hasSchema: boolean;
  schemaTypes: string[];
}

export interface FetchedPage {
  url: string;
  html: string;
  statusCode: number;
  headers: Record<string, string>;
  redirectedUrl?: string;
}

export type ScoreLevel = "excellent" | "good" | "moderate" | "poor";

export function getScoreLevel(percentage: number): ScoreLevel {
  if (percentage >= 80) return "excellent";
  if (percentage >= 60) return "good";
  if (percentage >= 40) return "moderate";
  return "poor";
}

export function getScoreLabel(percentage: number): string {
  const level = getScoreLevel(percentage);
  return {
    excellent: "Excellent",
    good: "Good",
    moderate: "Needs Work",
    poor: "Poor",
  }[level];
}
