"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, subDays } from "date-fns";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Bot, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DailyData {
  date: string;
  aiTraffic: number;
  totalTraffic: number;
}

interface AnalyticsData {
  chartData: DailyData[];
  totalAiVisits: number;
  totalVisits: number;
  topSource: { name: string; visits: number } | null;
}

// Generate demo data
function generateDemoData(): AnalyticsData {
  const days: DailyData[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const total = 30 + Math.floor(Math.random() * 50);
    days.push({
      date: format(date, "yyyy-MM-dd"),
      aiTraffic: Math.floor(total * (0.2 + Math.random() * 0.3)),
      totalTraffic: total,
    });
  }

  const totalAi = days.reduce((sum, d) => sum + d.aiTraffic, 0);
  const totalAll = days.reduce((sum, d) => sum + d.totalTraffic, 0);

  return {
    chartData: days,
    totalAiVisits: totalAi,
    totalVisits: totalAll,
    topSource: { name: "ChatGPT", visits: Math.floor(totalAi * 0.4) },
  };
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium">{label ? format(new Date(label), "MMM d") : ""}</p>
      <p className="text-muted-foreground">
        AI Traffic: <span className="font-medium text-foreground">{payload[0].value}</span>
      </p>
    </div>
  );
};

export function AnalyticsPreview() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const startDate = format(subDays(new Date(), 6), "yyyy-MM-dd");
        const endDate = format(new Date(), "yyyy-MM-dd");

        const response = await fetch(
          `/api/analytics?startDate=${startDate}&endDate=${endDate}`
        );

        if (response.ok) {
          const result = await response.json();
          if (result.totals.totalVisits === 0) {
            setIsDemo(true);
            setData(generateDemoData());
          } else {
            setIsDemo(false);
            setData({
              chartData: result.trafficChartData,
              totalAiVisits: result.totals.aiVisits,
              totalVisits: result.totals.totalVisits,
              topSource: result.aiSourceData[0] || null,
            });
          }
        } else {
          setIsDemo(true);
          setData(generateDemoData());
        }
      } catch {
        setIsDemo(true);
        setData(generateDemoData());
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
        <Bot className="h-8 w-8 mb-2 opacity-50" />
        <p>No analytics data yet</p>
      </div>
    );
  }

  const aiPercentage = data.totalVisits > 0
    ? ((data.totalAiVisits / data.totalVisits) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-2 py-1">
          <Sparkles className="h-3 w-3" />
          <span>Demo data - install tracking to see real traffic</span>
        </div>
      )}

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-2xl font-bold">{data.totalAiVisits}</p>
          <p className="text-xs text-muted-foreground">AI visits</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{aiPercentage}%</p>
          <p className="text-xs text-muted-foreground">of traffic</p>
        </div>
        <div>
          <p className="text-2xl font-bold truncate">{data.topSource?.name || "-"}</p>
          <p className="text-xs text-muted-foreground">top source</p>
        </div>
      </div>

      {/* Mini chart */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.chartData}>
            <defs>
              <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={false}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="aiTraffic"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#aiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
