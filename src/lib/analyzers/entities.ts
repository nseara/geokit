import type { ExtractionResult } from "../scanner/extractor";
import type { ScoreDetail, ScoreFactor } from "../scanner/types";
import { getScoreLabel } from "../scanner/types";

// Common question patterns
const questionPatterns = [
  /what is/gi,
  /how to/gi,
  /how do/gi,
  /why is/gi,
  /when should/gi,
  /where can/gi,
  /who is/gi,
  /which is/gi,
  /can you/gi,
  /does it/gi,
];

// Fact patterns (numbers, statistics, specific claims)
const factPatterns = [
  /\d+%/g, // Percentages
  /\$[\d,]+/g, // Money
  /\d{4}/g, // Years
  /\d+ (million|billion|thousand)/gi, // Large numbers
  /according to/gi, // Citations
  /research shows/gi,
  /studies indicate/gi,
  /data suggests/gi,
];

// Definition patterns
const definitionPatterns = [
  /is defined as/gi,
  /refers to/gi,
  /means that/gi,
  /is a type of/gi,
  /is known as/gi,
  /is characterized by/gi,
];

export function analyzeEntities(extraction: ExtractionResult): ScoreDetail {
  const { content, title } = extraction;
  const text = content.text;
  const factors: ScoreFactor[] = [];
  let score = 0;
  const maxScore = 100;

  // Factor 1: Clear topic definition (25 points)
  // Check if the title/first paragraph clearly states the topic
  const firstParagraph = text.split(/\n\n/)[0] || "";
  const hasDefinition = definitionPatterns.some((pattern) =>
    pattern.test(firstParagraph)
  );
  const titleInContent = title && text.toLowerCase().includes(title.toLowerCase().slice(0, 20));

  if (hasDefinition && titleInContent) {
    score += 25;
    factors.push({
      name: "Topic Definition",
      value: "Clear and explicit",
      impact: "positive",
    });
  } else if (hasDefinition || titleInContent) {
    score += 18;
    factors.push({
      name: "Topic Definition",
      value: "Present",
      impact: "neutral",
      suggestion: "Add a clear definition of your topic in the first paragraph",
    });
  } else {
    score += 8;
    factors.push({
      name: "Topic Definition",
      value: "Unclear",
      impact: "negative",
      suggestion: "Start with a clear definition: 'X is...' or 'X refers to...'",
    });
  }

  // Factor 2: Questions answered (25 points)
  const questionsAnswered = questionPatterns.reduce((count, pattern) => {
    return count + (text.match(pattern)?.length || 0);
  }, 0);

  if (questionsAnswered >= 5) {
    score += 25;
    factors.push({
      name: "Questions Addressed",
      value: `${questionsAnswered} question patterns`,
      impact: "positive",
    });
  } else if (questionsAnswered >= 2) {
    score += 15;
    factors.push({
      name: "Questions Addressed",
      value: `${questionsAnswered} question patterns`,
      impact: "neutral",
      suggestion: "Add more 'What is', 'How to', 'Why' sections for AI Q&A",
    });
  } else {
    score += 5;
    factors.push({
      name: "Questions Addressed",
      value: `${questionsAnswered} question patterns`,
      impact: "negative",
      suggestion: "Structure content around common questions (What, How, Why)",
    });
  }

  // Factor 3: Facts and statistics (25 points)
  const factsCount = factPatterns.reduce((count, pattern) => {
    return count + (text.match(pattern)?.length || 0);
  }, 0);

  if (factsCount >= 5) {
    score += 25;
    factors.push({
      name: "Facts & Statistics",
      value: `${factsCount} data points`,
      impact: "positive",
    });
  } else if (factsCount >= 2) {
    score += 15;
    factors.push({
      name: "Facts & Statistics",
      value: `${factsCount} data points`,
      impact: "neutral",
      suggestion: "Add more specific numbers, statistics, and citations",
    });
  } else {
    score += 5;
    factors.push({
      name: "Facts & Statistics",
      value: `${factsCount} data points`,
      impact: "negative",
      suggestion: "Include statistics, percentages, and specific data - AI loves citing facts",
    });
  }

  // Factor 4: Named entities (15 points)
  // Look for capitalized terms (potential named entities)
  const namedEntities = text.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g) || [];
  const uniqueEntities = [...new Set(namedEntities)].filter(
    (e) => e.length > 3 && !["The", "This", "That", "These", "Those"].includes(e)
  );

  if (uniqueEntities.length >= 10) {
    score += 15;
    factors.push({
      name: "Named Entities",
      value: `${uniqueEntities.length} unique entities`,
      impact: "positive",
    });
  } else if (uniqueEntities.length >= 5) {
    score += 10;
    factors.push({
      name: "Named Entities",
      value: `${uniqueEntities.length} unique entities`,
      impact: "neutral",
    });
  } else {
    score += 5;
    factors.push({
      name: "Named Entities",
      value: `${uniqueEntities.length} entities`,
      impact: "negative",
      suggestion: "Reference specific tools, companies, or concepts by name",
    });
  }

  // Factor 5: Comparative language (10 points)
  // AI engines often look for comparisons
  const comparisonPatterns = [
    /better than/gi,
    /compared to/gi,
    /versus/gi,
    /vs\./gi,
    /alternative to/gi,
    /similar to/gi,
    /unlike/gi,
    /difference between/gi,
  ];

  const comparisons = comparisonPatterns.reduce((count, pattern) => {
    return count + (text.match(pattern)?.length || 0);
  }, 0);

  if (comparisons >= 3) {
    score += 10;
    factors.push({
      name: "Comparisons",
      value: `${comparisons} comparison phrases`,
      impact: "positive",
    });
  } else if (comparisons >= 1) {
    score += 6;
    factors.push({
      name: "Comparisons",
      value: `${comparisons} comparison phrases`,
      impact: "neutral",
      suggestion: "Add comparisons (X vs Y, better than, compared to)",
    });
  } else {
    score += 2;
    factors.push({
      name: "Comparisons",
      value: "None found",
      impact: "negative",
      suggestion: "Include comparisons to help AI understand context",
    });
  }

  const percentage = Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    percentage,
    label: getScoreLabel(percentage),
    description: "How clearly your content presents facts and answers questions",
    factors,
  };
}
