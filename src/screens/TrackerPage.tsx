import { BookOpen } from "lucide-react";
import { CompletionEstimate } from "../components/CompletionEstimate";
import { DailyChart } from "../components/DailyChart";
import { DatePicker } from "../components/DatePicker";
import { Panel } from "../components/Panel";
import { ProgressCard } from "../components/ProgressCard";
import { SessionTable } from "../components/SessionTable";
import { WeekPicker } from "../components/WeekPicker";
import { WeeklyChart } from "../components/WeeklyChart";
import { WeeklySummaryTable } from "../components/WeeklySummaryTable";
import type { ReadingState } from "../types";
import { getDailyTotal, getWeeklySummaries, getWeeklyTotal } from "../utils/reading";

type TrackerPageProps = {
  state: ReadingState;
  ready: boolean;
  actions: {
    setDailyGoal: (goal: number) => void;
    setWeeklyGoal: (goal: number) => void;
    selectDate: (dateKey: string) => void;
    selectWeek: (weekStart: string) => void;
    addSession: (dateKey: string) => string;
    updateSession: (dateKey: string, sessionId: string, field: "startPage" | "endPage", value: number) => void;
    deleteSession: (dateKey: string, sessionId: string) => void;
  };
};

export function TrackerPage({ state, ready, actions }: TrackerPageProps) {
  const selectedSessions = state.sessionsByDate[state.selectedDate] || [];
  const weeklyDays = getWeeklySummaries(state);
  const dailyTotal = getDailyTotal(state);
  const weeklyTotal = getWeeklyTotal(state);
  const weeklySessions = weeklyDays.reduce((total, day) => total + day.sessions, 0);

  return (
    <>
      <div className="progress-grid">
        <ProgressCard
          label="Daily Goal"
          current={dailyTotal}
          goal={state.dailyGoal}
          onGoalChange={actions.setDailyGoal}
        />
        <ProgressCard
          label="Weekly Goal"
          current={weeklyTotal}
          goal={state.weeklyGoal}
          onGoalChange={actions.setWeeklyGoal}
        />
      </div>
      <div className="estimate-grid">
        <CompletionEstimate
          label="Daily Estimate"
          currentPages={dailyTotal}
          goalPages={state.dailyGoal}
          completedSessions={selectedSessions.length}
        />
        <CompletionEstimate
          label="Weekly Estimate"
          currentPages={weeklyTotal}
          goalPages={state.weeklyGoal}
          completedSessions={weeklySessions}
        />
      </div>

      <main className="tracker-grid" aria-busy={!ready}>
        <Panel
          title="Daily Reading"
          actions={<DatePicker selectedDate={state.selectedDate} onChange={actions.selectDate} />}
        >
          <div className="panel-section">
            <SessionTable
              sessions={selectedSessions}
              onAdd={() => actions.addSession(state.selectedDate)}
              onUpdate={(sessionId, field, value) => actions.updateSession(state.selectedDate, sessionId, field, value)}
              onDelete={(sessionId) => actions.deleteSession(state.selectedDate, sessionId)}
              enableKeyboardShortcut
            />
          </div>
          <div className="panel-section">
            <div className="section-heading">
              <BookOpen size={18} aria-hidden="true" />
              <h3>Pages per Pomodoro</h3>
            </div>
            <DailyChart sessions={selectedSessions} />
          </div>
        </Panel>

        <Panel
          title="Weekly Reading"
          actions={<WeekPicker selectedWeek={state.selectedWeek} onChange={actions.selectWeek} />}
        >
          <div className="panel-section">
            <WeeklyChart days={weeklyDays} />
          </div>
          <div className="panel-section">
            <WeeklySummaryTable days={weeklyDays} onSelectDate={actions.selectDate} />
          </div>
        </Panel>
      </main>
    </>
  );
}
