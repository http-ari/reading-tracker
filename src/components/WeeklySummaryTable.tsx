import type { WeekDaySummary } from "../types";
import { formatShortDate } from "../utils/date";
import { formatNumber } from "../utils/reading";

type WeeklySummaryTableProps = {
  days: WeekDaySummary[];
  onSelectDate: (dateKey: string) => void;
};

export function WeeklySummaryTable({ days, onSelectDate }: WeeklySummaryTableProps) {
  return (
    <div className="table-scroll">
      <table>
        <caption>Weekly reading summary</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Sessions</th>
            <th scope="col">Pages read</th>
            <th scope="col">Reading rate</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr
              key={day.dateKey}
              className={day.isFuture ? "is-future" : "is-clickable"}
              onClick={() => {
                if (!day.isFuture) {
                  onSelectDate(day.dateKey);
                }
              }}
            >
              <th scope="row">
                <button
                  className="row-button"
                  type="button"
                  disabled={day.isFuture}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectDate(day.dateKey);
                  }}
                >
                  <span>{day.label}</span>
                  <small>{formatShortDate(day.dateKey)}</small>
                </button>
              </th>
              <td>{day.sessions || "—"}</td>
              <td>{day.pages ? formatNumber(day.pages) : "—"}</td>
              <td>{day.rate == null ? "—" : `${formatNumber(day.rate)} pages / 50 min`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
