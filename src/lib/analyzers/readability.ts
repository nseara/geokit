import type { ExtractionResult } from "../scanner/extractor";
import type { ScoreDetail, ScoreFactor } from "../scanner/types";
import { getScoreLabel } from "../scanner/types";

export function analyzeReadability(extraction: ExtractionResult): ScoreDetail {
  const { content } = extraction;
  const factors: ScoreFactor[] = [];
  let score = 0;
  const maxScore = 100;

  // Factor 1: Content length (20 points)
  const wordCount = content.wordCount;
  if (wordCount >= 1500) {
    score += 20;
    factors.push({
      name: "Content Length",
      value: `${wordCount} words`,
      impact: "positive",
    });
  } else if (wordCount >= 800) {
    score += 15;
    factors.push({
      name: "Content Length",
      value: `${wordCount} words`,
      impact: "neutral",
      suggestion: "Consider adding more comprehensive content (1500+ words)",
    });
  } else if (wordCount >= 300) {
    score += 10;
    factors.push({
      name: "Content Length",
      value: `${wordCount} words`,
      impact: "negative",
      suggestion: "Content is thin. AI engines prefer comprehensive coverage.",
    });
  } else {
    factors.push({
      name: "Content Length",
      value: `${wordCount} words`,
      impact: "negative",
      suggestion: "Very short content. Add substantial information for better AI visibility.",
    });
  }

  // Factor 2: Sentence structure (20 points)
  const sentences = content.text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength =
    sentences.length > 0
      ? content.text.split(/\s+/).length / sentences.length
      : 0;

  if (avgSentenceLength >= 10 && avgSentenceLength <= 20) {
    score += 20;
    factors.push({
      name: "Sentence Length",
      value: `${avgSentenceLength.toFixed(1)} words/sentence`,
      impact: "positive",
    });
  } else if (avgSentenceLength >= 8 && avgSentenceLength <= 25) {
    score += 15;
    factors.push({
      name: "Sentence Length",
      value: `${avgSentenceLength.toFixed(1)} words/sentence`,
      impact: "neutral",
    });
  } else if (avgSentenceLength > 25) {
    score += 8;
    factors.push({
      name: "Sentence Length",
      value: `${avgSentenceLength.toFixed(1)} words/sentence`,
      impact: "negative",
      suggestion: "Sentences are too long. Break them up for better readability.",
    });
  } else {
    score += 10;
    factors.push({
      name: "Sentence Length",
      value: `${avgSentenceLength.toFixed(1)} words/sentence`,
      impact: "negative",
      suggestion: "Sentences are very short. Add more detail and context.",
    });
  }

  // Factor 3: Paragraph structure (20 points)
  const paragraphs = content.text
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 50);
  const paragraphCount = paragraphs.length;

  if (paragraphCount >= 5) {
    score += 20;
    factors.push({
      name: "Paragraph Structure",
      value: `${paragraphCount} paragraphs`,
      impact: "positive",
    });
  } else if (paragraphCount >= 3) {
    score += 15;
    factors.push({
      name: "Paragraph Structure",
      value: `${paragraphCount} paragraphs`,
      impact: "neutral",
      suggestion: "Add more paragraphs to break up content",
    });
  } else {
    score += 5;
    factors.push({
      name: "Paragraph Structure",
      value: `${paragraphCount} paragraphs`,
      impact: "negative",
      suggestion: "Content needs better paragraph organization",
    });
  }

  // Factor 4: Reading level / complexity (20 points)
  // Simple approximation using syllable count per word
  const words = content.text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const complexWords = words.filter((word) => countSyllables(word) >= 3).length;
  const complexityRatio = words.length > 0 ? complexWords / words.length : 0;

  if (complexityRatio <= 0.2) {
    score += 20;
    factors.push({
      name: "Reading Complexity",
      value: "Easy to read",
      impact: "positive",
    });
  } else if (complexityRatio <= 0.3) {
    score += 15;
    factors.push({
      name: "Reading Complexity",
      value: "Moderate",
      impact: "neutral",
    });
  } else {
    score += 8;
    factors.push({
      name: "Reading Complexity",
      value: "Complex",
      impact: "negative",
      suggestion: "Simplify language for broader accessibility",
    });
  }

  // Factor 5: Clear language (20 points)
  // Check for passive voice indicators, jargon, etc.
  const passiveIndicators = [
    "was",
    "were",
    "been",
    "being",
    "is being",
    "are being",
    "has been",
    "have been",
    "had been",
    "will be",
  ];
  const passiveCount = passiveIndicators.reduce((count, indicator) => {
    const regex = new RegExp(`\\b${indicator}\\b`, "gi");
    return count + (content.text.match(regex)?.length || 0);
  }, 0);

  const passiveRatio =
    sentences.length > 0 ? passiveCount / sentences.length : 0;

  if (passiveRatio <= 0.1) {
    score += 20;
    factors.push({
      name: "Active Voice",
      value: "Strong",
      impact: "positive",
    });
  } else if (passiveRatio <= 0.2) {
    score += 15;
    factors.push({
      name: "Active Voice",
      value: "Good",
      impact: "neutral",
    });
  } else {
    score += 8;
    factors.push({
      name: "Active Voice",
      value: "Needs improvement",
      impact: "negative",
      suggestion: "Use more active voice for clearer communication",
    });
  }

  const percentage = Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    percentage,
    label: getScoreLabel(percentage),
    description:
      "How easily AI engines can parse and understand your content",
    factors,
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");

  const vowelMatches = word.match(/[aeiouy]{1,2}/g);
  return vowelMatches ? vowelMatches.length : 1;
}
