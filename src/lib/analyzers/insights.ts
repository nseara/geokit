import type { ExtractionResult } from "../scanner/extractor";
import type { CategoryScores, Insight, ScoreFactor } from "../scanner/types";

export function generateInsights(
  scores: CategoryScores,
  extraction: ExtractionResult
): Insight[] {
  const insights: Insight[] = [];

  // Analyze each category for insights
  for (const [category, scoreDetail] of Object.entries(scores)) {
    const categoryKey = category as keyof CategoryScores;

    // Find negative factors that need improvement
    for (const factor of scoreDetail.factors) {
      if (factor.impact === "negative" && factor.suggestion) {
        insights.push({
          type: "improvement",
          category: categoryKey,
          title: `Improve ${factor.name}`,
          description: factor.suggestion,
          impact: determineImpact(factor.name, scoreDetail.percentage),
          action: getActionForFactor(factor.name),
        });
      }
    }

    // Add success insights for high-performing areas
    if (scoreDetail.percentage >= 80) {
      const positiveFactors = scoreDetail.factors.filter(
        (f: ScoreFactor) => f.impact === "positive"
      );
      if (positiveFactors.length > 0) {
        insights.push({
          type: "success",
          category: categoryKey,
          title: `Strong ${getCategoryLabel(categoryKey)}`,
          description: `Your ${getCategoryLabel(categoryKey).toLowerCase()} is excellent. ${positiveFactors[0].name} is particularly strong.`,
          impact: "low",
        });
      }
    }

    // Add warnings for borderline scores
    if (scoreDetail.percentage >= 40 && scoreDetail.percentage < 60) {
      insights.push({
        type: "warning",
        category: categoryKey,
        title: `${getCategoryLabel(categoryKey)} needs attention`,
        description: `Your ${getCategoryLabel(categoryKey).toLowerCase()} score is borderline. Small improvements can have big impact.`,
        impact: "medium",
      });
    }
  }

  // Add specific high-impact recommendations based on content analysis
  addContentSpecificInsights(insights, scores, extraction);

  // Sort by impact (high first) and type (improvements first)
  return insights.sort((a, b) => {
    const typeOrder = { improvement: 0, warning: 1, success: 2 };
    const impactOrder = { high: 0, medium: 1, low: 2 };

    const typeCompare = typeOrder[a.type] - typeOrder[b.type];
    if (typeCompare !== 0) return typeCompare;

    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}

function determineImpact(
  factorName: string,
  categoryPercentage: number
): "high" | "medium" | "low" {
  // High impact factors
  const highImpactFactors = [
    "Schema Markup",
    "Topic Definition",
    "Author Info",
    "Heading Structure",
  ];

  if (highImpactFactors.includes(factorName) && categoryPercentage < 60) {
    return "high";
  }

  // Medium impact factors
  const mediumImpactFactors = [
    "Lists",
    "Questions Addressed",
    "Citations & Sources",
    "Meta Description",
  ];

  if (mediumImpactFactors.includes(factorName)) {
    return "medium";
  }

  return "low";
}

function getActionForFactor(factorName: string): string | undefined {
  const actions: Record<string, string> = {
    "Schema Markup": "Add JSON-LD structured data",
    "Heading Structure": "Reorganize headings hierarchy",
    "Author Info": "Add author byline with credentials",
    "Topic Definition": "Add clear definition in first paragraph",
    "Lists": "Convert key points to bullet lists",
    "Questions Addressed": "Add FAQ section",
    "Meta Description": "Write compelling meta description",
    "Citations & Sources": "Add external reference links",
    "Date Information": "Add publication and update dates",
    "Content Length": "Expand content with more detail",
    "Images": "Add descriptive alt text",
    "Trust Signals": "Add contact and about pages",
    "Expertise Signals": "Highlight credentials and experience",
    "Facts & Statistics": "Include specific data and numbers",
    "Named Entities": "Reference specific tools and concepts",
    "Comparisons": "Add comparison sections",
    "Reading Complexity": "Simplify complex sentences",
    "Active Voice": "Rewrite passive sentences",
  };

  return actions[factorName];
}

function getCategoryLabel(category: keyof CategoryScores): string {
  const labels: Record<keyof CategoryScores, string> = {
    readability: "Readability",
    structure: "Structure",
    entities: "Entity Clarity",
    sources: "Source Credibility",
  };
  return labels[category];
}

function addContentSpecificInsights(
  insights: Insight[],
  scores: CategoryScores,
  extraction: ExtractionResult
): void {
  // Check for missing schema - critical for AI visibility
  if (!extraction.metadata.hasSchema) {
    // Move to front if not already there
    const schemaInsight = insights.find(
      (i) => i.title.includes("Schema")
    );
    if (!schemaInsight) {
      insights.unshift({
        type: "improvement",
        category: "structure",
        title: "Add Schema Markup",
        description:
          "Schema.org structured data is critical for AI search engines. Add FAQ, Article, or HowTo schema.",
        impact: "high",
        action: "Implement JSON-LD structured data",
      });
    }
  }

  // Check word count
  if (extraction.content.wordCount < 500) {
    insights.unshift({
      type: "improvement",
      category: "readability",
      title: "Expand Content",
      description: `At ${extraction.content.wordCount} words, your content may be too thin. AI engines prefer comprehensive coverage of topics.`,
      impact: "high",
      action: "Add more detailed information (target 1500+ words)",
    });
  }

  // Check for missing author
  if (!extraction.metadata.author) {
    const authorInsight = insights.find((i) => i.title.includes("Author"));
    if (!authorInsight) {
      insights.unshift({
        type: "improvement",
        category: "sources",
        title: "Add Author Attribution",
        description:
          "Author information is a key E-E-A-T signal. AI engines trust content with clear authorship.",
        impact: "high",
        action: "Add author name, bio, and credentials",
      });
    }
  }

  // Limit total insights to most important ones
  const maxInsights = 10;
  if (insights.length > maxInsights) {
    insights.length = maxInsights;
  }
}
