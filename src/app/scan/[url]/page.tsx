"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Layout,
  Brain,
  Shield,
  ArrowLeft,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Share2,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UrlInput } from "@/components/scanner/url-input";
import type { ScanResult, ScoreDetail, Insight } from "@/lib/scanner/types";

const categoryIcons = {
  readability: BookOpen,
  structure: Layout,
  entities: Brain,
  sources: Shield,
};

const categoryLabels = {
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

export default function ScanResultPage() {
  const params = useParams();
  const encodedUrl = params.url as string;
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchScan() {
      try {
        const decodedUrl = decodeURIComponent(encodedUrl);
        const response = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: decodedUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to scan URL");
        }

        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (encodedUrl) {
      fetchScan();
    }
  }, [encodedUrl]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} url={decodeURIComponent(encodedUrl)} />;
  }

  if (!result) {
    return <ErrorState error="No results found" url={decodeURIComponent(encodedUrl)} />;
  }

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
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
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
        {/* Back link and URL */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Scan another URL
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold truncate max-w-xl">
              {result.title}
            </h1>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {result.url}
          </p>
        </div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <ScoreRing score={result.overallScore} size={160} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">
                    AI Visibility Score
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {getScoreMessage(result.overallScore)}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {result.metadata.hasSchema && (
                      <Badge variant="success">Has Schema</Badge>
                    )}
                    {result.metadata.author && (
                      <Badge variant="secondary">Author: {result.metadata.author}</Badge>
                    )}
                    <Badge variant="outline">
                      {result.content.wordCount} words
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Scores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {(Object.entries(result.scores) as [keyof typeof result.scores, ScoreDetail][]).map(
            ([key, score], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CategoryCard category={key} score={score} />
              </motion.div>
            )
          )}
        </div>

        {/* Insights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Top Insights</h2>
          <div className="space-y-3">
            {result.insights.slice(0, 5).map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <InsightCard insight={insight} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* New Scan */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Scan another URL
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

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold">Analyzing your page...</h2>
        <p className="text-muted-foreground">
          Scanning content, structure, and AI signals
        </p>
      </div>
    </div>
  );
}

function ErrorState({ error, url }: { error: string; url: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Scan Failed</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground truncate">{url}</p>
          <Link href="/">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try another URL
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={getScoreColor(score)}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${progress} ${circumference}` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className={`text-4xl font-bold ${getScoreColor(score)}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  score,
}: {
  category: keyof typeof categoryIcons;
  score: ScoreDetail;
}) {
  const Icon = categoryIcons[category];

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
          {categoryLabels[category]}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{score.label}</p>
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const iconMap = {
    improvement: Lightbulb,
    warning: AlertTriangle,
    success: CheckCircle,
  };
  const colorMap = {
    improvement: "text-blue-500",
    warning: "text-yellow-500",
    success: "text-green-500",
  };
  const bgMap = {
    improvement: "bg-blue-50 dark:bg-blue-900/20",
    warning: "bg-yellow-50 dark:bg-yellow-900/20",
    success: "bg-green-50 dark:bg-green-900/20",
  };
  const impactColorMap = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  const Icon = iconMap[insight.type];

  return (
    <Card className={bgMap[insight.type]}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Icon className={`h-5 w-5 mt-0.5 ${colorMap[insight.type]}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium">{insight.title}</span>
              <Badge
                variant="outline"
                className={`text-xs ${impactColorMap[insight.impact]}`}
              >
                {insight.impact} impact
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {insight.description}
            </p>
            {insight.action && (
              <p className="text-sm font-medium mt-2 text-primary">
                Action: {insight.action}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getScoreMessage(score: number): string {
  if (score >= 80) {
    return "Excellent! Your content is well-optimized for AI search engines.";
  }
  if (score >= 60) {
    return "Good foundation. A few improvements can significantly boost your AI visibility.";
  }
  if (score >= 40) {
    return "Needs work. Several optimizations are needed for better AI visibility.";
  }
  return "Significant improvements needed. Your content may struggle to appear in AI responses.";
}
