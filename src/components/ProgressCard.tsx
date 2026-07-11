import { InlineNumberInput } from "./InlineNumberInput";
import { formatNumber } from "../utils/reading";

type ProgressCardProps = {
  label: string;
  current: number;
  goal: number;
  onGoalChange: (goal: number) => void;
};

export function ProgressCard({ label, current, goal, onGoalChange }: ProgressCardProps) {
  const percentage = goal > 0 ? Math.min(999, (current / goal) * 100) : 0;
  const capped = Math.min(100, percentage);
  const remaining = Math.max(goal - current, 0);

  return (
    <section className="card progress-card" aria-label={`${label} progress`}>
      <div className="progress-heading">
        <h2>{label}</h2>
      </div>
      <div className="progress-metric">
        <strong>{formatNumber(current)}</strong>
        <span>
          of{" "}
          <InlineNumberInput
            value={goal}
            onCommit={onGoalChange}
            ariaLabel={`Edit ${label.toLowerCase()} page goal`}
            suffix=" pages"
          />
        </span>
      </div>
      <div className="progress-row">
        <span>{formatNumber(percentage)}%</span>
        <span>{formatNumber(remaining)} pages left</span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div style={{ width: `${capped}%` }} />
      </div>
    </section>
  );
}
