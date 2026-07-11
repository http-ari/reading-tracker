import { formatNumber } from "../utils/reading";

type CompletionEstimateProps = {
  label: string;
  currentPages: number;
  goalPages: number;
  completedSessions: number;
};

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function CompletionEstimate({ label, currentPages, goalPages, completedSessions }: CompletionEstimateProps) {
  const remainingPages = Math.max(goalPages - currentPages, 0);
  const averagePages = completedSessions > 0 ? currentPages / completedSessions : 0;
  const remainingSessions = remainingPages > 0 && averagePages > 0 ? Math.ceil(remainingPages / averagePages) : 0;
  const minutes = remainingSessions * 50;
  const isComplete = remainingPages === 0 && goalPages > 0;
  const hasEstimate = remainingSessions > 0;

  return (
    <section className="card estimate-card" aria-label={`${label} estimated time until completion`}>
      <div className="estimate-heading">
        <h2>{label}</h2>
      </div>
      <strong>{isComplete ? "Complete" : hasEstimate ? formatDuration(minutes) : "No estimate yet"}</strong>
      <p>
        {isComplete
          ? "Goal reached."
          : hasEstimate
            ? `${remainingSessions} Pomodoro${remainingSessions === 1 ? "" : "s"} at ${formatNumber(averagePages)} pages each.`
            : "Add a session to calculate pace."}
      </p>
    </section>
  );
}
