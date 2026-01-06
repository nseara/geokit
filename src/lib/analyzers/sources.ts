import type { ExtractionResult } from "../scanner/extractor";
import { extractLinks } from "../scanner/extractor";
import type { ScoreDetail, ScoreFactor } from "../scanner/types";
import { getScoreLabel } from "../scanner/types";

export function analyzeSources(extraction: ExtractionResult): ScoreDetail {
  const { $, metadata, content, rawHtml } = extraction;
  const factors: ScoreFactor[] = [];
  let score = 0;
  const maxScore = 100;

  // Factor 1: Author information (25 points)
  if (metadata.author) {
    // Check if author has additional credentials/bio
    const authorBioPatterns = [
      /author/i,
      /written by/i,
      /by\s+[A-Z][a-z]+/,
      /expert/i,
      /specialist/i,
    ];
    const hasAuthorContext = authorBioPatterns.some((p) =>
      p.test(rawHtml.slice(0, 5000))
    );

    if (hasAuthorContext) {
      score += 25;
      factors.push({
        name: "Author Info",
        value: metadata.author,
        impact: "positive",
      });
    } else {
      score += 18;
      factors.push({
        name: "Author Info",
        value: metadata.author,
        impact: "neutral",
        suggestion: "Add author bio/credentials to boost credibility",
      });
    }
  } else {
    score += 0;
    factors.push({
      name: "Author Info",
      value: "Missing",
      impact: "negative",
      suggestion: "Add author name and credentials - critical for E-E-A-T",
    });
  }

  // Factor 2: Publication/update dates (20 points)
  const hasPublishDate = !!metadata.publishDate;
  const hasModifiedDate = !!metadata.modifiedDate;

  if (hasPublishDate && hasModifiedDate) {
    score += 20;
    factors.push({
      name: "Date Information",
      value: "Published & Updated dates",
      impact: "positive",
    });
  } else if (hasPublishDate || hasModifiedDate) {
    score += 12;
    factors.push({
      name: "Date Information",
      value: hasPublishDate ? "Published date only" : "Updated date only",
      impact: "neutral",
      suggestion: "Add both publication and last-updated dates",
    });
  } else {
    score += 0;
    factors.push({
      name: "Date Information",
      value: "Missing",
      impact: "negative",
      suggestion: "Add visible publication and update dates",
    });
  }

  // Factor 3: External references/citations (25 points)
  const links = extractLinks($, extraction.title);
  const externalLinks = links.external;

  // Check for citation patterns in content
  const citationPatterns = [
    /according to/gi,
    /research by/gi,
    /study by/gi,
    /source:/gi,
    /\[(\d+)\]/g, // Academic citations
    /\([\d]{4}\)/g, // Year citations
  ];

  const citationCount = citationPatterns.reduce((count, pattern) => {
    return count + (content.text.match(pattern)?.length || 0);
  }, 0);

  if (externalLinks >= 5 && citationCount >= 2) {
    score += 25;
    factors.push({
      name: "Citations & Sources",
      value: `${externalLinks} external links, ${citationCount} citations`,
      impact: "positive",
    });
  } else if (externalLinks >= 2 || citationCount >= 1) {
    score += 15;
    factors.push({
      name: "Citations & Sources",
      value: `${externalLinks} links, ${citationCount} citations`,
      impact: "neutral",
      suggestion: "Add more external references to authoritative sources",
    });
  } else {
    score += 5;
    factors.push({
      name: "Citations & Sources",
      value: "Minimal",
      impact: "negative",
      suggestion: "Link to authoritative sources - AI engines verify claims",
    });
  }

  // Factor 4: Trust signals (15 points)
  const trustSignals = {
    hasHttps: true, // Assumed from fetch
    hasContactInfo:
      /contact|email|phone|address/i.test(rawHtml) ||
      $('a[href^="mailto:"]').length > 0,
    hasPrivacyPolicy:
      /privacy/i.test($("a").text()) ||
      $('a[href*="privacy"]').length > 0,
    hasAboutPage:
      /about/i.test($("a").text()) || $('a[href*="about"]').length > 0,
  };

  const trustScore = Object.values(trustSignals).filter(Boolean).length;

  if (trustScore >= 3) {
    score += 15;
    factors.push({
      name: "Trust Signals",
      value: `${trustScore}/4 signals present`,
      impact: "positive",
    });
  } else if (trustScore >= 2) {
    score += 10;
    factors.push({
      name: "Trust Signals",
      value: `${trustScore}/4 signals`,
      impact: "neutral",
      suggestion: "Add contact info, about page, and privacy policy links",
    });
  } else {
    score += 5;
    factors.push({
      name: "Trust Signals",
      value: `${trustScore}/4 signals`,
      impact: "negative",
      suggestion: "Add trust indicators: contact info, about page, privacy policy",
    });
  }

  // Factor 5: Expertise indicators (15 points)
  const expertisePatterns = [
    /years of experience/gi,
    /certified/gi,
    /licensed/gi,
    /expert/gi,
    /professional/gi,
    /specialist/gi,
    /PhD|Ph\.D\.|doctorate/gi,
    /MD|M\.D\./gi,
    /award/gi,
    /recognized/gi,
  ];

  const expertiseCount = expertisePatterns.reduce((count, pattern) => {
    return count + (content.text.match(pattern)?.length || 0);
  }, 0);

  if (expertiseCount >= 3) {
    score += 15;
    factors.push({
      name: "Expertise Signals",
      value: `${expertiseCount} credentials mentioned`,
      impact: "positive",
    });
  } else if (expertiseCount >= 1) {
    score += 10;
    factors.push({
      name: "Expertise Signals",
      value: `${expertiseCount} credentials`,
      impact: "neutral",
      suggestion: "Highlight author credentials and experience",
    });
  } else {
    score += 3;
    factors.push({
      name: "Expertise Signals",
      value: "None detected",
      impact: "negative",
      suggestion: "Demonstrate expertise: certifications, experience, credentials",
    });
  }

  const percentage = Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    percentage,
    label: getScoreLabel(percentage),
    description: "Credibility signals that make AI trust your content",
    factors,
  };
}
