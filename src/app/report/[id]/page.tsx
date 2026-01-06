import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  Layout,
  Brain,
  Shield,
  ExternalLink,
  Github,
  Share2,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UrlInput } from "@/components/scanner/url-input";
import { ShareButton } from "@/components/dashboard/share-button";
import { createServiceClient } from "@/lib/supabase/server";
import type { Insight, ScoreDetail } from "@/lib/scanner/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: scan } = await supabase
    .from("scans")
    .select("title, url, overall_score, description")
    .eq("share_id", id)
    .eq("is_public", true)
    .single() as unknown as { data: { title: string; url: string; overall_score: number; description: string | null } | null };

  if (!scan) {
    return {
      title: "Report Not Found - GeoKit",
    };
  }

  const title = `${scan.title} scored ${scan.overall_score}/100 - GeoKit`;
  const description =
    scan.description ||
    `See the AI visibility score for ${scan.url}. Analyzed by GeoKit.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `/api/og?id=${id}`,
          width: 1200,
          height: 630,
          alt: `AI Visibility Score: ${scan.overall_score}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?id=${id}`],
    },
  };
}

interface ScanData {
  id: string;
  url: string;
  title: string;
  overall_score: number;
  readability_score: number;
  structure_score: number;
  entities_score: number;
  sources_score: number;
  word_count: number;
  has_schema: boolean;
  author: string | null;
  insights: unknown;
  full_result: unknown;
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: scan } = await supabase
    .from("scans")
    .select("*")
    .eq("share_id", id)
    .eq("is_public", true)
    .single() as unknown as { data: ScanData | null };

  if (!scan) {
    notFound();
  }

  const fullResult = scan.full_result as {
    scores: Record<string, ScoreDetail>;
    insights: Insight[];
  } | null;

  const scores = fullResult?.scores || {
    readability: { score: scan.readability_score, maxScore: 100, percentage: scan.readability_score, label: "Readability", factors: [] },
    structure: { score: scan.structure_score, maxScore: 100, percentage: scan.structure_score, label: "Structure", factors: [] },
    entities: { score: scan.entities_score, maxScore: 100, percentage: scan.entities_score, label: "Entities", factors: [] },
    sources: { score: scan.sources_score, maxScore: 100, percentage: scan.sources_score, label: "Sources", factors: [] },
  };

  const insights = (scan.insights as Insight[]) || fullResult?.insights || [];
  const shareUrl = `${process.env.AUTH_URL || "https://geokit.dev"}/report/${id}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">GeoKit</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShareButton url={shareUrl} title={scan.title} score={scan.overall_score} />
            <Link
              href="https://github.com/geokit/geokit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Report Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            Public Report
          </Badge>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold truncate max-w-xl">
              {scan.title}
            </h1>
            <a
              href={scan.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {scan.url}
          </p>
        </div>

        {/* Overall Score */}
        <Card className="overflow-hidden mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <ScoreRing score={scan.overall_score} size={160} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">AI Visibility Score</h2>
                <p className="text-muted-foreground mb-4">
                  {getScoreMessage(scan.overall_score)}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {scan.has_schema && <Badge variant="success">Has Schema</Badge>}
                  {scan.author && (
                    <Badge variant="secondary">Author: {scan.author}</Badge>
                  )}
                  <Badge variant="outline">{scan.word_count} words</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(scores).map(([key, score]) => (
            <CategoryCard key={key} category={key} score={score} />
          ))}
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Top Insights</h2>
            <div className="space-y-3">
              {insights.slice(0, 5).map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* Social Share */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Share this report</h3>
                <p className="text-sm text-muted-foreground">
                  Help others discover their AI visibility score
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `My site scored ${scan.overall_score}/100 on AI visibility! Check yours at`
                    )}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      shareUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">
            Want to check your own site?
          </h2>
          <UrlInput />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            GeoKit - Open source AI SEO toolkit.{" "}
            <Link
              href="https://github.com/geokit/geokit"
              className="underline hover:text-foreground"
            >
              Star on GitHub
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

const categoryIcons: Record<string, typeof BookOpen> = {
  readability: BookOpen,
  structure: Layout,
  entities: Brain,
  sources: Shield,
};

const categoryLabels: Record<string, string> = {
  readability: "Readability",
  structure: "Structure",
  entities: "Entity Clarity",
  sources: "Source Credibility",
};

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600 dark:text-green-400";
  if (percentage >= 60) return "text-green-500 dark:text-green-500";
  if (percentage >= 40) return "text-yellow-500 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

function getScoreBgColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-100 dark:bg-green-900/30";
  if (percentage >= 60) return "bg-green-50 dark:bg-green-900/20";
  if (percentage >= 40) return "bg-yellow-50 dark:bg-yellow-900/20";
  return "bg-red-50 dark:bg-red-900/20";
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={getScoreColor(score)}
          strokeDasharray={`${progress} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  score,
}: {
  category: string;
  score: ScoreDetail;
}) {
  const Icon = categoryIcons[category] || BookOpen;

  return (
    <Card className={getScoreBgColor(score.percentage)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className={`text-2xl font-bold ${getScoreColor(score.percentage)}`}>
            {score.percentage}
          </span>
        </div>
        <CardTitle className="text-sm font-medium">
          {categoryLabels[category] || category}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{score.label}</p>
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const bgMap: Record<string, string> = {
    improvement: "bg-blue-50 dark:bg-blue-900/20",
    warning: "bg-yellow-50 dark:bg-yellow-900/20",
    success: "bg-green-50 dark:bg-green-900/20",
  };

  return (
    <Card className={bgMap[insight.type] || ""}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium">{insight.title}</span>
              <Badge variant="outline" className="text-xs">
                {insight.impact} impact
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getScoreMessage(score: number): string {
  if (score >= 80) {
    return "Excellent! This content is well-optimized for AI search engines.";
  }
  if (score >= 60) {
    return "Good foundation. A few improvements can significantly boost AI visibility.";
  }
  if (score >= 40) {
    return "Needs work. Several optimizations are needed for better AI visibility.";
  }
  return "Significant improvements needed. This content may struggle to appear in AI responses.";
}
