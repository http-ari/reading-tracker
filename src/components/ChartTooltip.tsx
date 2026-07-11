import { formatNumber } from "../utils/reading";

type TooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number; name?: string; payload?: Record<string, unknown> }>;
};

export function ChartTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }
  const value = Number(payload[0].value || 0);
  return (
    <div className="chart-tooltip">
      <strong>{String(label)}</strong>
      <span>{formatNumber(value)} pages</span>
    </div>
  );
}
