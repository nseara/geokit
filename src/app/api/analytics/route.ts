import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

interface DailyStats {
  date: string;
  chatgpt_visits: number;
  perplexity_visits: number;
  claude_visits: number;
  google_ai_visits: number;
  bing_copilot_visits: number;
  gemini_visits: number;
  other_ai_visits: number;
  organic_visits: number;
  direct_visits: number;
  referral_visits: number;
  unknown_visits: number;
  total_visits: number;
  total_ai_visits: number;
}

interface ScoreHistoryRow {
  scanned_at: string;
  overall_score: number;
  readability_score: number;
  structure_score: number;
  entities_score: number;
  sources_score: number;
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const siteId = searchParams.get("siteId");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Build query for traffic stats
  let trafficQuery = supabase
    .from("traffic_daily_stats")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (siteId) {
    trafficQuery = trafficQuery.eq("site_id", siteId);
  }

  // Build query for score history
  let scoreQuery = supabase
    .from("score_history")
    .select("scanned_at, overall_score, readability_score, structure_score, entities_score, sources_score")
    .eq("user_id", session.user.id)
    .gte("scanned_at", startDate)
    .lte("scanned_at", `${endDate}T23:59:59`)
    .order("scanned_at", { ascending: true });

  if (siteId) {
    scoreQuery = scoreQuery.eq("site_id", siteId);
  }

  // Execute queries in parallel
  const [trafficResult, scoreResult] = await Promise.all([
    trafficQuery as unknown as Promise<{ data: DailyStats[] | null; error: Error | null }>,
    scoreQuery as unknown as Promise<{ data: ScoreHistoryRow[] | null; error: Error | null }>,
  ]);

  const trafficData = trafficResult.data || [];
  const scoreData = scoreResult.data || [];

  // Calculate totals
  const totals = trafficData.reduce(
    (acc, day) => ({
      totalVisits: acc.totalVisits + (day.total_visits || 0),
      aiVisits: acc.aiVisits + (day.total_ai_visits || 0),
      chatgptVisits: acc.chatgptVisits + (day.chatgpt_visits || 0),
      perplexityVisits: acc.perplexityVisits + (day.perplexity_visits || 0),
      claudeVisits: acc.claudeVisits + (day.claude_visits || 0),
      googleAiVisits: acc.googleAiVisits + (day.google_ai_visits || 0),
      bingCopilotVisits: acc.bingCopilotVisits + (day.bing_copilot_visits || 0),
      geminiVisits: acc.geminiVisits + (day.gemini_visits || 0),
      otherAiVisits: acc.otherAiVisits + (day.other_ai_visits || 0),
      organicVisits: acc.organicVisits + (day.organic_visits || 0),
      directVisits: acc.directVisits + (day.direct_visits || 0),
      referralVisits: acc.referralVisits + (day.referral_visits || 0),
    }),
    {
      totalVisits: 0,
      aiVisits: 0,
      chatgptVisits: 0,
      perplexityVisits: 0,
      claudeVisits: 0,
      googleAiVisits: 0,
      bingCopilotVisits: 0,
      geminiVisits: 0,
      otherAiVisits: 0,
      organicVisits: 0,
      directVisits: 0,
      referralVisits: 0,
    }
  );

  // Format data for charts
  const trafficChartData = trafficData.map((day) => ({
    date: day.date,
    aiTraffic: day.total_ai_visits || 0,
    organicTraffic: day.organic_visits || 0,
    directTraffic: day.direct_visits || 0,
    totalTraffic: day.total_visits || 0,
  }));

  const aiSourceData = [
    { name: "ChatGPT", visits: totals.chatgptVisits, color: "#10a37f" },
    { name: "Perplexity", visits: totals.perplexityVisits, color: "#7c3aed" },
    { name: "Claude", visits: totals.claudeVisits, color: "#d97706" },
    { name: "Google AI", visits: totals.googleAiVisits, color: "#4285f4" },
    { name: "Bing Copilot", visits: totals.bingCopilotVisits, color: "#00a4ef" },
    { name: "Gemini", visits: totals.geminiVisits, color: "#db4437" },
  ].filter((s) => s.visits > 0);

  const sourceBreakdown = [
    { name: "AI Traffic", value: totals.aiVisits, color: "hsl(var(--chart-1))" },
    { name: "Organic", value: totals.organicVisits, color: "#22c55e" },
    { name: "Direct", value: totals.directVisits, color: "#3b82f6" },
    { name: "Referral", value: totals.referralVisits, color: "#a855f7" },
  ].filter((s) => s.value > 0);

  const scoreChartData = scoreData.map((scan) => ({
    date: scan.scanned_at.split("T")[0],
    overall: scan.overall_score,
    readability: scan.readability_score,
    structure: scan.structure_score,
    entities: scan.entities_score,
    sources: scan.sources_score,
  }));

  // Calculate score change
  let scoreChange = 0;
  if (scoreChartData.length >= 2) {
    const firstScore = scoreChartData[0].overall;
    const lastScore = scoreChartData[scoreChartData.length - 1].overall;
    scoreChange = lastScore - firstScore;
  }

  return NextResponse.json({
    totals,
    trafficChartData,
    aiSourceData,
    sourceBreakdown,
    scoreChartData,
    scoreChange,
    latestScore: scoreChartData.length > 0 ? scoreChartData[scoreChartData.length - 1].overall : null,
  });
}
