import { Trash2 } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { AddSessionButton, TodayButton } from "../components/Buttons";
import { CompletionEstimate } from "../components/CompletionEstimate";
import { DailyChart } from "../components/DailyChart";
import { DatePicker } from "../components/DatePicker";
import { InlineNumberInput } from "../components/InlineNumberInput";
import { Panel } from "../components/Panel";
import { ProgressCard } from "../components/ProgressCard";
import { SessionTable } from "../components/SessionTable";
import { WeekPicker } from "../components/WeekPicker";
import { WeeklyChart } from "../components/WeeklyChart";
import { WeeklySummaryTable } from "../components/WeeklySummaryTable";
import { backgroundOptions, type BackgroundKey } from "../theme";
import type { ReadingState, Session } from "../types";
import { addDays, startOfWeek, todayKey } from "../utils/date";
import { getWeeklySummaries } from "../utils/reading";

const sampleDate = todayKey();
const sampleWeek = startOfWeek(sampleDate);
const colourTokens = [
  {
    name: "Indigo Ink",
    variable: "--indigo-ink",
    description: "#151936 · Primary text and chart ink.",
  },
  {
    name: "Paper",
    variable: "--paper",
    description: "#fffdf6 · Main card and panel surface.",
  },
  {
    name: "Pressed line",
    variable: "--pressed-line",
    description: "Selectable page background shade.",
  },
  {
    name: "Pressed paper",
    variable: "--paper-pressed",
    description: "#f0eadf · Hover and inactive progress shade.",
  },
  {
    name: "Ink wash",
    variable: "--ink-wash",
    description: "#202a67 · Primary actions and progress fill.",
  },
  {
    name: "Moss",
    variable: "--moss",
    description: "#56634b · Secondary chart line.",
  },
  {
    name: "Sandalwood",
    variable: "--sandalwood",
    description: "#8b5b32 · Warm supporting accent.",
  },
  {
    name: "Red seal",
    variable: "--red-seal",
    description: "#8f2d25 · Delete and destructive actions.",
  },
  {
    name: "Red seal soft",
    variable: "--red-seal-soft",
    description: "#f4e6df · Soft destructive hover surface.",
  },
  {
    name: "Muted ink",
    variable: "--muted-ink",
    description: "#686354 · Secondary text and chart labels.",
  },
  {
    name: "Rule line",
    variable: "--rule-line",
    description: "#d7c8ac · Borders, dividers, and table rules.",
  },
  {
    name: "Strong rule line",
    variable: "--rule-line-strong",
    description: "#9e8f73 · Hover and emphasized borders.",
  },
];
const typographyValues = [
  {
    name: "Serif family",
    example: "Ledger",
    value: "--font-serif: Iowan Old Style / Palatino",
    description:
      "The notebook voice for the app. Used for headings, page titles, card titles, and longer reading surfaces.",
    sampleClass: "type-sample-display",
  },
  {
    name: "Sans family",
    example: "Index",
    value: "--font-sans: Inter / system sans",
    description:
      "The working interface face. Used for buttons, picker labels, tables, metadata, and compact status text.",
    sampleClass: "type-sample-sans",
  },
  {
    name: "Heading scale",
    example: "Reading",
    value: "--type-title / --type-panel / --type-subhead",
    description:
      "The display, panel, and section heading sizes. Tune these together when the app needs more or less hierarchy.",
    sampleClass: "type-sample-title",
  },
  {
    name: "Reading rhythm",
    example: "Notes",
    value: "--type-base: 17px / --type-body: 1rem / --leading-body: 1.5",
    description:
      "The default text system for descriptions, table cells, helper copy, and repeated reading surfaces.",
    sampleClass: "type-sample-body",
  },
  {
    name: "Control text",
    example: "Today",
    value: "--type-control: 0.98rem",
    description:
      "Buttons, inline editable values, picker triggers, calendar days, and compact interactive elements.",
    sampleClass: "type-sample-control",
  },
  {
    name: "Metadata text",
    example: "Week",
    value: "--type-small: 0.9rem / --type-label: 0.82rem / --tracking-label: 0.055em",
    description:
      "Secondary copy, chart ticks, captions, table headers, picker labels, and small contextual details.",
    sampleClass: "type-sample-label",
  },
  {
    name: "Metric scale",
    example: "Pages",
    value: "--type-progress: clamp(1.8rem, 3vw, 2.25rem) / --leading-tight: 1.08",
    description:
      "Large numeric values used by progress cards, completion estimates, and quick scanning moments.",
    sampleClass: "type-sample-progress",
  },
  {
    name: "Heading leading",
    example: "Estimate",
    value: "--leading-heading: 1.18",
    description:
      "Shared line height for headings so titles stay composed without needing separate per-component values.",
    sampleClass: "type-sample-leading",
  },
];

type ComponentsPageProps = {
  background: BackgroundKey;
  onBackgroundChange: (background: BackgroundKey) => void;
};

export function ComponentsPage({ background, onBackgroundChange }: ComponentsPageProps) {
  const [goal, setGoal] = useState(30);
  const [date, setDate] = useState(sampleDate);
  const [week, setWeek] = useState(sampleWeek);
  const [sessions, setSessions] = useState<Session[]>([
    { id: "one", startPage: 1, endPage: 12.5 },
    { id: "two", startPage: 13.5, endPage: 22 },
  ]);
  const state: ReadingState = {
    dailyGoal: goal,
    weeklyGoal: 120,
    background,
    selectedDate: date,
    selectedWeek: week,
    sessionsByDate: {
      [sampleDate]: sessions,
      [addDays(sampleDate, -1)]: [{ id: "three", startPage: 44, endPage: 58 }],
    },
  };

  const updateSession = (sessionId: string, field: "startPage" | "endPage", value: number) => {
    setSessions((current) => current.map((session) => (session.id === sessionId ? { ...session, [field]: value } : session)));
  };
  const selectedBackground = backgroundOptions.find((option) => option.key === background) ?? backgroundOptions[0];

  return (
    <main className="components-page">
      <Panel title="Colour Tokens" subtitle="Shared values used by cards, controls, tables, and charts.">
        <div
          className="background-picker"
          style={{ "--background-swatch": selectedBackground.value } as CSSProperties}
        >
          <span className="background-picker-swatch" aria-hidden="true" />
          <label>
            <span>Background shade</span>
            <select
              value={background}
              onChange={(event) => onBackgroundChange(event.target.value as BackgroundKey)}
            >
              {backgroundOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label} · {option.value}
                </option>
              ))}
            </select>
          </label>
          <small>{selectedBackground.description}</small>
        </div>
        <div className="token-grid">
          {colourTokens.map((token) => (
            <div
              className="token"
              key={token.name}
              style={{ "--token-color": `var(${token.variable})` } as CSSProperties}
            >
              <span aria-hidden="true" />
              <div>
                <strong>{token.name}</strong>
                <small>{token.variable} · {token.description}</small>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Typography" subtitle="The hierarchy used across tracker panels.">
        <div className="type-stack">
          <h1>Reading Tracker</h1>
          <h2>Daily Reading</h2>
          <h3>Pages per Pomodoro</h3>
          <p>Body text stays compact for tables, controls, and repeated review work.</p>
        </div>
        <div className="type-token-grid">
          {typographyValues.map((item) => (
            <article className="type-token" key={item.name}>
              <div>
                <span className={item.sampleClass}>{item.example}</span>
                <strong>{item.name}</strong>
              </div>
              <p>{item.description}</p>
              <small>{item.value}</small>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Progress Cards" subtitle="Goal values are edited inline and progress bars update immediately.">
        <div className="progress-grid">
          <ProgressCard label="Daily Goal" current={18.5} goal={goal} onGoalChange={setGoal} />
          <ProgressCard label="Weekly Goal" current={74} goal={120} onGoalChange={() => undefined} />
        </div>
      </Panel>

      <Panel title="Completion Estimate" subtitle="Projected time uses remaining pages and the current Pomodoro pace.">
        <div className="estimate-grid">
          <CompletionEstimate label="Daily Estimate" currentPages={18.5} goalPages={goal} completedSessions={2} />
          <CompletionEstimate label="Weekly Estimate" currentPages={74} goalPages={120} completedSessions={6} />
        </div>
      </Panel>

      <Panel title="Controls" subtitle="Each control is shown with its intended role and interaction pattern.">
        <div className="control-demo-grid">
          <article className="control-spec">
            <div>
              <h3>Add session</h3>
              <p>Primary action for creating the next Pomodoro row.</p>
            </div>
            <AddSessionButton
              onClick={() =>
                setSessions((current) => [
                  ...current,
                  { id: `${Date.now()}`, startPage: current.at(-1)?.endPage ? current.at(-1)!.endPage + 1 : 1, endPage: current.at(-1)?.endPage ? current.at(-1)!.endPage + 1 : 1 },
                ])
              }
            />
          </article>
          <article className="control-spec">
            <div>
              <h3>Today shortcut</h3>
              <p>Returns date navigation to the current day.</p>
            </div>
            <TodayButton onClick={() => setDate(todayKey())} />
          </article>
          <article className="control-spec">
            <div>
              <h3>Inline number</h3>
              <p>Click-to-edit numeric field for goals and page values.</p>
            </div>
            <InlineNumberInput value={goal} onCommit={setGoal} ariaLabel="Edit sample number" suffix=" pages" />
          </article>
          <article className="control-spec">
            <div>
              <h3>Delete action</h3>
              <p>Destructive icon button used sparingly on rows and compact surfaces.</p>
            </div>
            <button className="icon-button danger" type="button" aria-label="Delete sample">
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </article>
          <article className="control-spec">
            <div>
              <h3>Date picker</h3>
              <p>Custom calendar popover with future dates disabled.</p>
            </div>
            <DatePicker selectedDate={date} onChange={setDate} />
          </article>
          <article className="control-spec">
            <div>
              <h3>Week picker</h3>
              <p>Custom week selector with previous and next navigation.</p>
            </div>
            <WeekPicker
              selectedWeek={week}
              onChange={setWeek}
            />
          </article>
        </div>
      </Panel>

      <Panel title="Session Table" subtitle="Start and end pages are decimal-friendly inline fields.">
        <SessionTable
          sessions={sessions}
          onAdd={() => {
            const previous = sessions.at(-1);
            const startPage = previous ? previous.endPage + 1 : 1;
            const id = `${Date.now()}`;
            setSessions((current) => [...current, { id, startPage, endPage: startPage }]);
            return id;
          }}
          onUpdate={updateSession}
          onDelete={(sessionId) => setSessions((current) => current.filter((session) => session.id !== sessionId))}
        />
      </Panel>

      <Panel title="Charts" subtitle="Daily and weekly charts use the same tooltip and visual language.">
        <div className="chart-demo-grid">
          <DailyChart sessions={sessions} />
          <WeeklyChart days={getWeeklySummaries(state, week)} />
        </div>
      </Panel>

      <Panel title="Weekly Summary Table" subtitle="Rows for future dates are disabled; past and current rows can open that day.">
        <WeeklySummaryTable days={getWeeklySummaries(state, week)} onSelectDate={setDate} />
      </Panel>
    </main>
  );
}
