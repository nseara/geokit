"use client";

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  TrendingUp,
  TrendingDown,
  Bot,
  Globe,
  MousePointer,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart,
  PieChart,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  TrafficAreaChart,
  SourceDonutChart,
  ScoreTrendChart,
  AISourceBarChart,
} from "@/components/charts";

interface AnalyticsData {
  totals: {
    totalVisits: number;
    aiVisits: number;
    chatgptVisits: number;
    perplexityVisits: number;
    claudeVisits: number;
    googleAiVisits: number;
    bingCopilotVisits: number;
    geminiVisits: number;
    otherAiVisits: number;
    organicVisits: number;
    directVisits: number;
    referralVisits: number;
  };
  trafficChartData: Array<{
    date: string;
    aiTraffic: number;
    organicTraffic: number;
    directTraffic: number;
    totalTraffic: number;
  }>;
  aiSourceData: Array<{ name: string; visits: number; color: string }>;
  sourceBreakdown: Array<{ name: string; value: number; color: string }>;
  scoreChartData: Array<{
    date: string;
    overall: number;
    readability?: number;
    structure?: number;
    entities?: number;
    sources?: number;
  }>;
  scoreChange: number;
  latestScore: number | null;
}

// Demo data for when there's no real data
function generateDemoData(startDate: Date, endDate: Date): AnalyticsData {
  const days: AnalyticsData["trafficChartData"] = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const baseTraffic = 50 + Math.floor(Math.random() * 100);
    days.push({
      date: format(current, "yyyy-MM-dd"),
      aiTraffic: Math.floor(baseTraffic * 0.3 + Math.random() * 30),
      organicTraffic: Math.floor(baseTraffic * 0.4 + Math.random() * 40),
      directTraffic: Math.floor(baseTraffic * 0.3 + Math.random() * 20),
      totalTraffic: baseTraffic,
    });
    current = new Date(current.setDate(current.getDate() + 1));
  }

  const scoreData = days.filter((_, i) => i % 7 === 0).map((d) => ({
    date: d.date,
    overall: 55 + Math.floor(Math.random() * 30),
    readability: 50 + Math.floor(Math.random() * 35),
    structure: 55 + Math.floor(Math.random() * 30),
    entities: 45 + Math.floor(Math.random() * 40),
    sources: 60 + Math.floor(Math.random() * 25),
  }));

  const totals = days.reduce(
    (acc, d) => ({
      totalVisits: acc.totalVisits + d.totalTraffic,
      aiVisits: acc.aiVisits + d.aiTraffic,
      organicVisits: acc.organicVisits + d.organicTraffic,
      directVisits: acc.directVisits + d.directTraffic,
    }),
    { totalVisits: 0, aiVisits: 0, organicVisits: 0, directVisits: 0 }
  );

  return {
    totals: {
      ...totals,
      chatgptVisits: Math.floor(totals.aiVisits * 0.35),
      perplexityVisits: Math.floor(totals.aiVisits * 0.25),
      claudeVisits: Math.floor(totals.aiVisits * 0.15),
      googleAiVisits: Math.floor(totals.aiVisits * 0.12),
      bingCopilotVisits: Math.floor(totals.aiVisits * 0.08),
      geminiVisits: Math.floor(totals.aiVisits * 0.05),
      otherAiVisits: 0,
      referralVisits: Math.floor(totals.totalVisits * 0.1),
    },
    trafficChartData: days,
    aiSourceData: [
      { name: "ChatGPT", visits: Math.floor(totals.aiVisits * 0.35), color: "#10a37f" },
      { name: "Perplexity", visits: Math.floor(totals.aiVisits * 0.25), color: "#7c3aed" },
      { name: "Claude", visits: Math.floor(totals.aiVisits * 0.15), color: "#d97706" },
      { name: "Google AI", visits: Math.floor(totals.aiVisits * 0.12), color: "#4285f4" },
      { name: "Bing Copilot", visits: Math.floor(totals.aiVisits * 0.08), color: "#00a4ef" },
      { name: "Gemini", visits: Math.floor(totals.aiVisits * 0.05), color: "#db4437" },
    ],
    sourceBreakdown: [
      { name: "AI Traffic", value: totals.aiVisits, color: "#8b5cf6" },
      { name: "Organic", value: totals.organicVisits, color: "#22c55e" },
      { name: "Direct", value: totals.directVisits, color: "#3b82f6" },
      { name: "Referral", value: Math.floor(totals.totalVisits * 0.1), color: "#a855f7" },
    ],
    scoreChartData: scoreData,
    scoreChange: scoreData.length >= 2 ? scoreData[scoreData.length - 1].overall - scoreData[0].overall : 0,
    latestScore: scoreData.length > 0 ? scoreData[scoreData.length - 1].overall : 72,
  };
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllScores, setShowAllScores] = useState(false);
  const [useDemoData, setUseDemoData] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!dateRange.from || !dateRange.to) return;

      setLoading(true);
      try {
        const startDate = format(dateRange.from, "yyyy-MM-dd");
        const endDate = format(dateRange.to, "yyyy-MM-dd");

        const response = await fetch(
          `/api/analytics?startDate=${startDate}&endDate=${endDate}`
        );

        if (response.ok) {
          const result = await response.json();
          // Check if there's any data
          if (result.totals.totalVisits === 0 && result.scoreChartData.length === 0) {
            setUseDemoData(true);
            setData(generateDemoData(dateRange.from, dateRange.to));
          } else {
            setUseDemoData(false);
            setData(result);
          }
        } else {
          // Use demo data on error
          setUseDemoData(true);
          setData(generateDemoData(dateRange.from, dateRange.to));
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setUseDemoData(true);
        setData(generateDemoData(dateRange.from!, dateRange.to!));
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [dateRange]);

  const aiPercentage = data
    ? ((data.totals.aiVisits / Math.max(data.totals.totalVisits, 1)) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your AI visibility and traffic from LLM providers
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={(range) => range && setDateRange(range)}
        />
      </div>

      {/* Demo data notice */}
      {useDemoData && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Demo Data</p>
              <p className="text-sm text-muted-foreground">
                This is sample data to preview the analytics experience. Install the tracking snippet to see your real traffic.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Get Tracking Code
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Traffic"
          value={data?.totals.totalVisits ?? 0}
          icon={<Globe className="h-4 w-4" />}
          loading={loading}
        />
        <StatsCard
          title="AI Traffic"
          value={data?.totals.aiVisits ?? 0}
          icon={<Bot className="h-4 w-4" />}
          badge={`${aiPercentage}%`}
          badgeColor="purple"
          loading={loading}
        />
        <StatsCard
          title="Current Score"
          value={data?.latestScore ?? 0}
          suffix="/100"
          icon={<Activity className="h-4 w-4" />}
          loading={loading}
        />
        <StatsCard
          title="Score Change"
          value={data?.scoreChange ?? 0}
          prefix={data?.scoreChange && data.scoreChange > 0 ? "+" : ""}
          icon={
            data?.scoreChange && data.scoreChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : data?.scoreChange && data.scoreChange < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Activity className="h-4 w-4" />
            )
          }
          valueColor={
            data?.scoreChange && data.scoreChange > 0
              ? "text-green-600"
              : data?.scoreChange && data.scoreChange < 0
              ? "text-red-600"
              : undefined
          }
          loading={loading}
        />
      </div>

      {/* Traffic Over Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Traffic Over Time
            </CardTitle>
            <CardDescription>
              Daily visits segmented by traffic source
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading chart...</div>
            </div>
          ) : data?.trafficChartData.length ? (
            <TrafficAreaChart data={data.trafficChartData} />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No traffic data available for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Sources and Traffic Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* AI Source Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Traffic by Source
            </CardTitle>
            <CardDescription>
              Visits from LLM providers and AI search engines
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : data?.aiSourceData.length ? (
              <AISourceBarChart data={data.aiSourceData} />
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground">
                <Bot className="h-12 w-12 mb-3 opacity-50" />
                <p>No AI traffic detected yet</p>
                <p className="text-sm">Improve your AI visibility score to attract more AI traffic</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Traffic Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of all traffic sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            ) : data?.sourceBreakdown.length ? (
              <SourceDonutChart data={data.sourceBreakdown} height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No traffic data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score Trends */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Score Trends
            </CardTitle>
            <CardDescription>
              Track your AI visibility score improvements over time
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllScores(!showAllScores)}
          >
            {showAllScores ? "Show Overall Only" : "Show All Categories"}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading chart...</div>
            </div>
          ) : data?.scoreChartData.length ? (
            <ScoreTrendChart
              data={data.scoreChartData}
              showAllScores={showAllScores}
              showReferenceLine
              referenceValue={70}
            />
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
              <Activity className="h-12 w-12 mb-3 opacity-50" />
              <p>No scan history yet</p>
              <p className="text-sm">Scan your site regularly to track score improvements</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Traffic Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>AI Traffic Sources</CardTitle>
          <CardDescription>
            Detailed breakdown of visits from AI platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "ChatGPT", visits: data?.totals.chatgptVisits ?? 0, color: "#10a37f", description: "OpenAI's conversational AI" },
              { name: "Perplexity", visits: data?.totals.perplexityVisits ?? 0, color: "#7c3aed", description: "AI-powered search engine" },
              { name: "Claude", visits: data?.totals.claudeVisits ?? 0, color: "#d97706", description: "Anthropic's AI assistant" },
              { name: "Google AI", visits: data?.totals.googleAiVisits ?? 0, color: "#4285f4", description: "Google AI Overviews & Gemini" },
              { name: "Bing Copilot", visits: data?.totals.bingCopilotVisits ?? 0, color: "#00a4ef", description: "Microsoft's AI search" },
              { name: "Gemini", visits: data?.totals.geminiVisits ?? 0, color: "#db4437", description: "Google's multimodal AI" },
            ].map((source) => (
              <div key={source.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{source.visits.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {data && data.totals.aiVisits > 0
                      ? ((source.visits / data.totals.aiVisits) * 100).toFixed(1)
                      : 0}
                    % of AI traffic
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: "default" | "purple" | "green" | "red";
  prefix?: string;
  suffix?: string;
  valueColor?: string;
  loading?: boolean;
}

function StatsCard({
  title,
  value,
  icon,
  badge,
  badgeColor = "default",
  prefix = "",
  suffix = "",
  valueColor,
  loading,
}: StatsCardProps) {
  const badgeVariants: Record<string, string> = {
    default: "bg-secondary",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${valueColor || ""}`}>
              {prefix}
              {value.toLocaleString()}
              {suffix}
            </span>
            {badge && (
              <Badge variant="secondary" className={badgeVariants[badgeColor]}>
                {badge}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
