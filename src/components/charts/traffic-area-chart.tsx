"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

export interface TrafficDataPoint {
  date: string;
  aiTraffic: number;
  organicTraffic: number;
  directTraffic: number;
  totalTraffic: number;
}

interface TrafficAreaChartProps {
  data: TrafficDataPoint[];
  showLegend?: boolean;
  height?: number;
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
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-medium">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export function TrafficAreaChart({
  data,
  showLegend = true,
  height = 350,
}: TrafficAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="aiTrafficGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="organicTrafficGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="directTrafficGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.toLocaleString()}
          className="text-xs fill-muted-foreground"
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground">{value}</span>
            )}
          />
        )}
        <Area
          type="monotone"
          dataKey="aiTraffic"
          name="AI Traffic"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#aiTrafficGradient)"
        />
        <Area
          type="monotone"
          dataKey="organicTraffic"
          name="Organic"
          stroke="hsl(var(--chart-2))"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#organicTrafficGradient)"
        />
        <Area
          type="monotone"
          dataKey="directTraffic"
          name="Direct"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#directTrafficGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
