import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Session } from "../types";
import { pageCount } from "../utils/reading";
import { ChartTooltip } from "./ChartTooltip";

type DailyChartProps = {
  sessions: Session[];
};

export function DailyChart({ sessions }: DailyChartProps) {
  const data = sessions.map((session, index) => ({
    name: `Session ${index + 1}`,
    pages: pageCount(session),
  }));

  return (
    <div className="chart-box" aria-label="Pages read per session">
      {data.length ? (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={44} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--line-strong)" }} />
            <Line
              type="linear"
              dataKey="pages"
              stroke="var(--chart-primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--surface)", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              name="Pages"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="empty-state">No sessions for this date.</div>
      )}
    </div>
  );
}
