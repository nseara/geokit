import type { ExtractionResult } from "../scanner/extractor";
import {
  extractHeadings,
  extractLists,
  extractImages,
} from "../scanner/extractor";
import type { ScoreDetail, ScoreFactor } from "../scanner/types";
import { getScoreLabel } from "../scanner/types";

export function analyzeStructure(extraction: ExtractionResult): ScoreDetail {
  const { $, metadata } = extraction;
  const factors: ScoreFactor[] = [];
  let score = 0;
  const maxScore = 100;

  // Factor 1: Heading hierarchy (25 points)
  const headings = extractHeadings($);
  const h1Count = headings.filter((h) => h.level === 1).length;
  const h2Count = headings.filter((h) => h.level === 2).length;
  const h3Count = headings.filter((h) => h.level === 3).length;

  if (h1Count === 1 && h2Count >= 2) {
    score += 25;
    factors.push({
      name: "Heading Structure",
      value: `1 H1, ${h2Count} H2s, ${h3Count} H3s`,
      impact: "positive",
    });
  } else if (h1Count === 1 && h2Count >= 1) {
    score += 18;
    factors.push({
      name: "Heading Structure",
      value: `1 H1, ${h2Count} H2s`,
      impact: "neutral",
      suggestion: "Add more H2 subheadings to organize content",
    });
  } else if (h1Count === 0) {
    score += 5;
    factors.push({
      name: "Heading Structure",
      value: "Missing H1",
      impact: "negative",
      suggestion: "Add a clear H1 heading to define the page topic",
    });
  } else if (h1Count > 1) {
    score += 10;
    factors.push({
      name: "Heading Structure",
      value: `${h1Count} H1s (should be 1)`,
      impact: "negative",
      suggestion: "Use only one H1 per page",
    });
  } else {
    score += 12;
    factors.push({
      name: "Heading Structure",
      value: `${h1Count} H1, ${h2Count} H2s`,
      impact: "neutral",
      suggestion: "Add subheadings to improve content hierarchy",
    });
  }

  // Factor 2: Lists (20 points)
  const lists = extractLists($);

  if (lists.totalItems >= 10) {
    score += 20;
    factors.push({
      name: "Lists",
      value: `${lists.ordered + lists.unordered} lists, ${lists.totalItems} items`,
      impact: "positive",
    });
  } else if (lists.totalItems >= 3) {
    score += 15;
    factors.push({
      name: "Lists",
      value: `${lists.ordered + lists.unordered} lists, ${lists.totalItems} items`,
      impact: "neutral",
      suggestion: "AI engines love structured lists. Consider adding more.",
    });
  } else if (lists.totalItems > 0) {
    score += 8;
    factors.push({
      name: "Lists",
      value: `${lists.totalItems} items`,
      impact: "neutral",
      suggestion: "Add bullet points or numbered lists for key information",
    });
  } else {
    score += 0;
    factors.push({
      name: "Lists",
      value: "None",
      impact: "negative",
      suggestion: "Add lists to highlight key points - AI engines extract these easily",
    });
  }

  // Factor 3: Schema.org markup (25 points)
  if (metadata.hasSchema && metadata.schemaTypes.length >= 2) {
    score += 25;
    factors.push({
      name: "Schema Markup",
      value: metadata.schemaTypes.join(", "),
      impact: "positive",
    });
  } else if (metadata.hasSchema) {
    score += 18;
    factors.push({
      name: "Schema Markup",
      value: metadata.schemaTypes.join(", ") || "Present",
      impact: "neutral",
      suggestion: "Add more schema types (FAQ, HowTo, Article) for richer AI understanding",
    });
  } else {
    score += 0;
    factors.push({
      name: "Schema Markup",
      value: "None",
      impact: "negative",
      suggestion: "Add JSON-LD schema markup - critical for AI visibility",
    });
  }

  // Factor 4: Images with alt text (15 points)
  const images = extractImages($);

  if (images.total === 0) {
    score += 8;
    factors.push({
      name: "Images",
      value: "No images",
      impact: "neutral",
      suggestion: "Consider adding relevant images with descriptive alt text",
    });
  } else if (images.withoutAlt === 0 && images.total >= 2) {
    score += 15;
    factors.push({
      name: "Images",
      value: `${images.total} images, all with alt text`,
      impact: "positive",
    });
  } else if (images.withAlt > images.withoutAlt) {
    score += 10;
    factors.push({
      name: "Images",
      value: `${images.withAlt}/${images.total} have alt text`,
      impact: "neutral",
      suggestion: `Add alt text to ${images.withoutAlt} images`,
    });
  } else {
    score += 5;
    factors.push({
      name: "Images",
      value: `${images.withoutAlt}/${images.total} missing alt text`,
      impact: "negative",
      suggestion: "Add descriptive alt text to all images",
    });
  }

  // Factor 5: Meta description (15 points)
  if (extraction.description && extraction.description.length >= 120) {
    score += 15;
    factors.push({
      name: "Meta Description",
      value: `${extraction.description.length} chars`,
      impact: "positive",
    });
  } else if (extraction.description && extraction.description.length >= 50) {
    score += 10;
    factors.push({
      name: "Meta Description",
      value: `${extraction.description.length} chars`,
      impact: "neutral",
      suggestion: "Expand meta description to 120-160 characters",
    });
  } else if (extraction.description) {
    score += 5;
    factors.push({
      name: "Meta Description",
      value: "Too short",
      impact: "negative",
      suggestion: "Write a compelling meta description (120-160 chars)",
    });
  } else {
    score += 0;
    factors.push({
      name: "Meta Description",
      value: "Missing",
      impact: "negative",
      suggestion: "Add a meta description summarizing the page content",
    });
  }

  const percentage = Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    percentage,
    label: getScoreLabel(percentage),
    description: "How well-organized your content is for AI parsing",
    factors,
  };
}
