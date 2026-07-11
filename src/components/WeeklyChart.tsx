import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeekDaySummary } from "../types";
import { formatShortDate } from "../utils/date";
import { ChartTooltip } from "./ChartTooltip";

type WeeklyChartProps = {
  days: WeekDaySummary[];
};

export function WeeklyChart({ days }: WeeklyChartProps) {
  const data = days.map((day) => ({
    name: formatShortDate(day.dateKey),
    pages: day.pages,
  }));

  return (
    <div className="chart-box" aria-label="Pages read per day for selected week">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={44} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--line-strong)" }} />
          <Line
            type="linear"
            dataKey="pages"
            stroke="var(--chart-secondary)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--surface)", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            name="Pages"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
