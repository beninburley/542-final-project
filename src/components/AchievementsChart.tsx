import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Achievement } from "../types";

type Bucket = {
  label: string;
  min: number;
  max: number;
  color: string;
};

const BUCKETS: Bucket[] = [
  { label: "Common",    min: 60,  max: 100, color: "#4caf50" },
  { label: "Moderate",  min: 40,  max: 60,  color: "#8bc34a" },
  { label: "Uncommon",  min: 20,  max: 40,  color: "#ff9800" },
  { label: "Rare",      min: 10,  max: 20,  color: "#f44336" },
  { label: "Very Rare", min: 0,   max: 10,  color: "#9c27b0" },
];

type ChartEntry = {
  label: string;
  count: number;
  color: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
};

/** Custom tooltip shown on bar hover. */
function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const count = payload[0].value;
  return (
    <div className="achievements-chart__tooltip">
      <strong>{label}</strong>
      <span>{count} achievement{count !== 1 ? "s" : ""}</span>
    </div>
  );
}

type Props = {
  achievements: Achievement[];
};

/**
 * Bar chart showing how achievements are distributed across difficulty buckets.
 * Uses recharts for rendering.
 */
export default function AchievementsChart({ achievements }: Props) {
  const data: ChartEntry[] = BUCKETS.map((b) => ({
    label: b.label,
    count: achievements.filter(
      (a) => a.percent >= b.min && a.percent < b.max,
    ).length,
    color: b.color,
  }));

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="achievements-chart">
      <h3 className="achievements-chart__title">Difficulty Distribution</h3>
      <p className="achievements-chart__subtitle">
        How many achievements fall into each completion-rate tier
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "var(--color-text-muted, #aaa)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, maxCount]}
            tick={{ fontSize: 12, fill: "var(--color-text-muted, #aaa)" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={true}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
