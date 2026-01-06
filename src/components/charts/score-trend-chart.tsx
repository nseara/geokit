"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

export interface ScoreDataPoint {
  date: string;
  overall: number;
  readability?: number;
  structure?: number;
  entities?: number;
  sources?: number;
}

interface ScoreTrendChartProps {
  data: ScoreDataPoint[];
  showAllScores?: boolean;
  height?: number;
  showReferenceLine?: boolean;
  referenceValue?: number;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">
        {label ? format(new Date(label), "MMM d, yyyy") : label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}</span>
          </div>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function ScoreTrendChart({
  data,
  showAllScores = false,
  height = 300,
  showReferenceLine = false,
  referenceValue = 70,
}: ScoreTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => format(new Date(value), "MMM d")}
          className="text-xs fill-muted-foreground"
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs fill-muted-foreground"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-sm text-muted-foreground capitalize">{value}</span>
          )}
        />
        {showReferenceLine && (
          <ReferenceLine
            y={referenceValue}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="5 5"
            label={{ value: "Target", position: "right", className: "text-xs fill-muted-foreground" }}
          />
        )}
        <Line
          type="monotone"
          dataKey="overall"
          name="Overall"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={{ r: 3, strokeWidth: 2 }}
          activeDot={{ r: 5 }}
        />
        {showAllScores && (
          <>
            <Line
              type="monotone"
              dataKey="readability"
              name="Readability"
              stroke="hsl(var(--chart-1))"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="structure"
              name="Structure"
              stroke="hsl(var(--chart-2))"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="entities"
              name="Entities"
              stroke="hsl(var(--chart-3))"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="sources"
              name="Sources"
              stroke="hsl(var(--chart-4))"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
