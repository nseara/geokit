"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface SourceDataPoint {
  name: string;
  value: number;
  color: string;
}

interface SourceDonutChartProps {
  data: SourceDataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}

const AI_SOURCE_COLORS: Record<string, string> = {
  ChatGPT: "#10a37f",
  Perplexity: "#1a1a2e",
  Claude: "#d97706",
  "Google AI": "#4285f4",
  "Bing Copilot": "#00a4ef",
  Gemini: "#8e44ad",
  "Other AI": "#6b7280",
  Organic: "#22c55e",
  Direct: "#3b82f6",
  Referral: "#a855f7",
  Unknown: "#9ca3af",
};

export function getSourceColor(sourceName: string): string {
  return AI_SOURCE_COLORS[sourceName] || "#6b7280";
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string; percentage: number } }>;
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0];
  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: data.payload.color }}
        />
        <span className="font-medium">{data.name}</span>
      </div>
      <p className="text-muted-foreground">
        {data.value.toLocaleString()} visits ({data.payload.percentage.toFixed(1)}%)
      </p>
    </div>
  );
};

const CustomLegend = ({ payload }: {
  payload?: Array<{ value: string; color: string }>;
}) => {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-sm">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function SourceDonutChart({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
  showLegend = true,
}: SourceDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={dataWithPercentage}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
        >
          {dataWithPercentage.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend content={<CustomLegend />} />}
      </PieChart>
    </ResponsiveContainer>
  );
}
