import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Component,
  Plus,
  Scale,
  Trash2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { initialState, STORAGE_KEY } from "./data";
import type { DayRecord, ReadingState, Session } from "./types";
import {
  dayTotal,
  dateKeysForWeek,
  addDays,
  addMonths,
  formatDateLabel,
  formatDayLabel,
  formatMonthLabel,
  formatNumber,
  formatShortDate,
  formatShortDayLabel,
  makeId,
  monthCalendarDates,
  pagesRead,
  parsePageInput,
  parseDateKey,
  readingRate,
  toDateKey,
  toWeekKey,
  weekNumberFromKey,
  weeklyTotal,
} from "./utils";

const TODAY_KEY = toDateKey(new Date());
const BASE_PATH = import.meta.env.BASE_URL;
const COMPONENTS_PATH = `${BASE_PATH}components`;

function loadState(): ReadingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        ...initialState,
        selectedDate: TODAY_KEY,
        selectedWeek: toWeekKey(TODAY_KEY),
        sessionsByDate: {
          ...initialState.sessionsByDate,
          [TODAY_KEY]: initialState.sessionsByDate[TODAY_KEY] ?? [],
        },
      };
    }
    const parsed = JSON.parse(raw) as Partial<ReadingState>;
    if (!parsed.sessionsByDate || !parsed.selectedDate || !parsed.selectedWeek) {
      return initialState;
    }
    return {
      ...initialState,
      ...parsed,
      selectedDate: TODAY_KEY,
      selectedWeek: toWeekKey(TODAY_KEY),
    };
  } catch {
    return initialState;
  }
}

export function App() {
  if (window.location.pathname === COMPONENTS_PATH || window.location.pathname.endsWith("/components")) {
    return <ComponentGallery />;
  }

  return <TrackerApp />;
}

function TrackerApp() {
  const [state, setState] = useState<ReadingState>(loadState);
  const [focusEndSessionId, setFocusEndSessionId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const weekDateKeys = useMemo(() => dateKeysForWeek(state.selectedWeek), [state.selectedWeek]);
  const selectedDay = useMemo(
    () => ({
      dateKey: state.selectedDate,
      label: formatDayLabel(state.selectedDate),
      shortLabel: formatShortDayLabel(state.selectedDate),
      sessions: state.sessionsByDate[state.selectedDate] ?? [],
    }),
    [state.selectedDate, state.sessionsByDate],
  );
  const weekDays = useMemo(
    () =>
      weekDateKeys.map((dateKey) => ({
        dateKey,
        label: formatDayLabel(dateKey),
        shortLabel: formatShortDayLabel(dateKey),
        sessions: state.sessionsByDate[dateKey] ?? [],
      })),
    [state.sessionsByDate, weekDateKeys],
  );

  const todayTotal = dayTotal(selectedDay);
  const weekTotal = weeklyTotal(weekDays);
  const todaySessions = selectedDay.sessions.length;
  const weekSessions = weekDays.reduce((sum, day) => sum + day.sessions.length, 0);

  const updateGoal = (key: "dailyGoal" | "weeklyGoal", value: number) => {
    setState((current) => ({ ...current, [key]: Math.max(1, value) }));
  };

  const updateDate = (selectedDate: string) => {
    if (!selectedDate || selectedDate > TODAY_KEY) return;
    setState((current) => ({
      ...current,
      selectedDate,
      selectedWeek: toWeekKey(selectedDate),
      sessionsByDate: {
        ...current.sessionsByDate,
        [selectedDate]: current.sessionsByDate[selectedDate] ?? [],
      },
    }));
  };

  const updateWeek = (selectedWeek: string) => {
    if (!selectedWeek) return;
    const weekDates = dateKeysForWeek(selectedWeek);
    const firstAvailableDate = weekDates.find((dateKey) => dateKey <= TODAY_KEY);
    if (!firstAvailableDate) return;
    const selectedDate = firstAvailableDate ?? state.selectedDate;
    setState((current) => ({
      ...current,
      selectedWeek,
      selectedDate,
      sessionsByDate: {
        ...current.sessionsByDate,
        [selectedDate]: current.sessionsByDate[selectedDate] ?? [],
      },
    }));
  };

  const updateSession = (
    sessionId: string,
    field: "startPage" | "endPage",
    value: number,
  ) => {
    setState((current) => ({
      ...current,
      sessionsByDate: {
        ...current.sessionsByDate,
        [current.selectedDate]: (current.sessionsByDate[current.selectedDate] ?? []).map(
          (session) => (session.id === sessionId ? { ...session, [field]: value } : session),
        ),
      },
    }));
  };

  const addSession = () => {
    const id = makeId();
    setState((current) => ({
      ...current,
      sessionsByDate: {
        ...current.sessionsByDate,
        [current.selectedDate]: [
          ...(current.sessionsByDate[current.selectedDate] ?? []),
          (() => {
            const lastEnd = (current.sessionsByDate[current.selectedDate] ?? []).at(-1)?.endPage;
            const startPage = lastEnd == null ? 1 : lastEnd + 1;
            return { id, startPage, endPage: startPage };
          })(),
        ],
      },
    }));
    setFocusEndSessionId(id);
  };

  const dailyChartData = selectedDay.sessions.map((session, index) => ({
    name: `S${index + 1}`,
    pages: pagesRead(session),
  }));

  const weeklyChartData = weekDays.map((day) => ({
    name: day.shortLabel,
    pages: dayTotal(day),
  }));

  const deleteSession = (sessionId: string) => {
    setState((current) => ({
      ...current,
      sessionsByDate: {
        ...current.sessionsByDate,
        [current.selectedDate]: (current.sessionsByDate[current.selectedDate] ?? []).filter(
          (session) => session.id !== sessionId,
        ),
      },
    }));
  };

  return (
    <main className="app-shell">
      <section className="tracker-layout">
        <section className="daily-column">
          <div className="app-title-row">
            <h1 className="app-title">Reading Tracker</h1>
            <a className="gallery-link" href={COMPONENTS_PATH}>
              <Component size={16} />
              Components
            </a>
          </div>

          <section className="panel left-panel">
            <div className="panel-heading">
              <DatePickerHeading
                value={state.selectedDate}
                label={formatDateLabel(state.selectedDate)}
                onChange={updateDate}
              />
              {state.selectedDate !== TODAY_KEY ? (
                <button className="today-button" type="button" onClick={() => updateDate(TODAY_KEY)}>
                  Today
                </button>
              ) : null}
            </div>

            <SessionTable
              sessions={selectedDay.sessions}
              focusEndSessionId={focusEndSessionId}
              onUpdate={updateSession}
              onDelete={deleteSession}
              onAdd={addSession}
              onFocusConsumed={() => setFocusEndSessionId(null)}
            />

            <ChartPanel
              title="Today's Pomodoros"
              caption={`${formatNumber(todayTotal)} pages • ${todaySessions || 0} sessions`}
            >
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={dailyChartData} margin={{ top: 18, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7b83b5" stopOpacity={0.26} />
                      <stop offset="95%" stopColor="#e7e9fe" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#d2d9dc" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="linear"
                    dataKey="pages"
                    stroke="#7b83b5"
                    strokeWidth={3}
                    fill="url(#dailyFill)"
                    dot={{ r: 5, fill: "#7b83b5", strokeWidth: 2, stroke: "#fbfaf7" }}
                    activeDot={{ r: 7 }}
                    isAnimationActive
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>
          </section>
        </section>

        <section className="weekly-column">
          <section className="topbar" aria-label="Reading progress">
            <ProgressCard
              label="Daily Goal"
              value={todayTotal}
              goal={state.dailyGoal}
              accent="daily"
              icon={<BookOpen size={18} />}
              onGoalChange={(goal) => updateGoal("dailyGoal", goal)}
            />
            <ProgressCard
              label="Weekly Goal"
              value={weekTotal}
              goal={state.weeklyGoal}
              accent="weekly"
              icon={<Scale size={18} />}
              onGoalChange={(goal) => updateGoal("weeklyGoal", goal)}
            />
          </section>

          <section className="panel right-panel">
            <div className="panel-heading">
              <div className="week-heading-group">
                <h2>
                  <WeekPickerHeading
                    value={state.selectedWeek}
                    label={`Week ${weekNumberFromKey(state.selectedWeek)}`}
                    onChange={updateWeek}
                  />
                </h2>
              </div>
            </div>

            <ChartPanel
              title="Weekly Distribution"
              caption={`${formatNumber(weekTotal)} pages • ${weekSessions} Pomodoros`}
            >
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weeklyChartData} margin={{ top: 18, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7b83b5" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#e7e9fe" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#d2d9dc" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="linear"
                    dataKey="pages"
                    stroke="#7b83b5"
                    strokeWidth={3}
                    fill="url(#weeklyFill)"
                    dot={{ r: 5, fill: "#7b83b5", strokeWidth: 2, stroke: "#fffaf7" }}
                    activeDot={{ r: 7 }}
                    isAnimationActive
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartPanel>

            <WeeklySummary days={weekDays} selectedDate={state.selectedDate} onSelectDate={updateDate} />
          </section>
        </section>
      </section>
    </main>
  );
}

function ComponentGallery() {
  const [dailyGoal, setDailyGoal] = useState(50);
  const [weeklyGoal, setWeeklyGoal] = useState(300);
  const [sampleValue, setSampleValue] = useState(32.5);
  const [sessions, setSessions] = useState<Session[]>([
    { id: "gallery-1", startPage: 25, endPage: 32 },
    { id: "gallery-2", startPage: 33, endPage: 40 },
  ]);

  const chartData = sessions.map((session, index) => ({
    name: `S${index + 1}`,
    pages: pagesRead(session),
  }));

  return (
    <main className="app-shell component-gallery">
      <header className="gallery-header">
        <div>
          <p className="gallery-kicker">Live design system</p>
          <h1>Reading Tracker Components</h1>
          <p>Every example below uses the same classes and components as the tracker.</p>
        </div>
        <a className="gallery-link gallery-link-back" href={BASE_PATH}>
          <ArrowLeft size={16} />
          Back to tracker
        </a>
      </header>

      <section className="gallery-section">
        <div className="gallery-section-heading">
          <span>01</span>
          <div>
            <h2>Colour system</h2>
            <p>Core surfaces, accents, text, and status colours.</p>
          </div>
        </div>
        <div className="swatch-grid">
          {[
            ["Accent", "#E7E9FE", "var(--accent)"],
            ["Accent strong", "#7B83B5", "var(--accent-strong)"],
            ["Accent secondary", "#C6CCFF", "var(--accent-secondary)"],
            ["Canvas", "#17243D", "#17243d"],
            ["Ink", "#171A1F", "#171a1f"],
            ["Danger", "#D92D20", "#d92d20"],
          ].map(([name, value, color]) => (
            <article className="color-swatch" key={name}>
              <span style={{ background: color }} />
              <strong>{name}</strong>
              <code>{value}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery-section">
        <div className="gallery-section-heading">
          <span>02</span>
          <div>
            <h2>Typography</h2>
            <p>The serif display face and compact interface hierarchy.</p>
          </div>
        </div>
        <div className="type-specimen panel">
          <div>
            <small>Display heading</small>
            <h2>Tuesday 7 Jul</h2>
          </div>
          <div>
            <small>Interface heading</small>
            <h3>Today&apos;s Pomodoros</h3>
          </div>
          <div>
            <small>Eyebrow</small>
            <p className="eyebrow">Daily goal</p>
          </div>
          <div>
            <small>Body</small>
            <p>Focused reading, measured one fifty-minute session at a time.</p>
          </div>
        </div>
      </section>

      <section className="gallery-section">
        <div className="gallery-section-heading">
          <span>03</span>
          <div>
            <h2>Progress cards</h2>
            <p>Click either goal value to test its inline edit state.</p>
          </div>
        </div>
        <div className="topbar gallery-progress-grid">
          <ProgressCard
            label="Daily Goal"
            value={27}
            goal={dailyGoal}
            accent="daily"
            icon={<BookOpen size={18} />}
            onGoalChange={setDailyGoal}
          />
          <ProgressCard
            label="Weekly Goal"
            value={82}
            goal={weeklyGoal}
            accent="weekly"
            icon={<Scale size={18} />}
            onGoalChange={setWeeklyGoal}
          />
        </div>
      </section>

      <section className="gallery-section">
        <div className="gallery-section-heading">
          <span>04</span>
          <div>
            <h2>Controls and editing</h2>
            <p>Primary actions, secondary actions, inline values, and destructive states.</p>
          </div>
        </div>
        <div className="control-showcase panel">
          <button className="add-button gallery-add-button" type="button">
            <Plus size={17} />
            add session
          </button>
          <button className="today-button" type="button">Today</button>
          <a className="gallery-link gallery-control-link" href={BASE_PATH}>
            <ArrowLeft size={16} />
            Back to tracker
          </a>
          <InlineNumber
            value={sampleValue}
            ariaLabel="Edit sample page value"
            onCommit={setSampleValue}
          />
          <span className="icon-chip"><BookOpen size={18} /></span>
          <button className="gallery-danger-button" type="button">
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </section>

      <section className="gallery-section">
        <div className="gallery-section-heading">
          <span>05</span>
          <div>
            <h2>Data surfaces</h2>
            <p>The live session table and chart shell used in the tracker.</p>
          </div>
        </div>
        <div className="gallery-data-grid">
          <SessionTable
            sessions={sessions}
            focusEndSessionId={null}
            onUpdate={(id, field, value) =>
              setSessions((current) =>
                current.map((session) => session.id === id ? { ...session, [field]: value } : session),
              )
            }
            onDelete={(id) => setSessions((current) => current.filter((session) => session.id !== id))}
            onAdd={() =>
              setSessions((current) => {
                const startPage = (current.at(-1)?.endPage ?? 0) + 1;
                return [...current, { id: makeId(), startPage, endPage: startPage }];
              })
            }
            onFocusConsumed={() => undefined}
          />
          <ChartPanel
            title="Today&apos;s Pomodoros"
            caption={`${formatNumber(sessions.reduce((sum, session) => sum + pagesRead(session), 0))} pages • ${sessions.length} sessions`}
          >
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={chartData} margin={{ top: 18, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#d2d9dc" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} allowDecimals />
                <Area
                  type="linear"
                  dataKey="pages"
                  stroke="#7b83b5"
                  strokeWidth={3}
                  fill="#e7e9fe"
                  dot={{ r: 5, fill: "#7b83b5", strokeWidth: 2, stroke: "#fbfaf7" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>
      </section>
    </main>
  );
}

function ProgressCard({
  label,
  value,
  goal,
  accent,
  icon,
  onGoalChange,
}: {
  label: string;
  value: number;
  goal: number;
  accent: "daily" | "weekly";
  icon: React.ReactNode;
  onGoalChange: (value: number) => void;
}) {
  const percent = Math.min(100, Math.round((value / goal) * 100));
  const fillCoversCopy = percent >= 30;

  return (
    <article
      className={`progress-card progress-card-${accent}${fillCoversCopy ? " is-filling-copy" : ""}`}
      style={{ "--progress": `${percent}%` } as React.CSSProperties}
    >
      <div className="progress-card-fill" aria-hidden="true" />
      <div className="progress-copy">
        <span className="icon-chip">{icon}</span>
        <div>
          <p>{label}</p>
          <InlineNumber
            value={goal}
            className="goal-edit"
            ariaLabel={`Edit ${label.toLowerCase()}`}
            render={(editing) =>
              editing ? undefined : (
                <strong>
                  {formatNumber(value)} / {formatNumber(goal)}
                </strong>
              )
            }
            onCommit={onGoalChange}
          />
        </div>
      </div>
      <div className="progress-meta">
        <span>{percent}%</span>
      </div>
    </article>
  );
}

function SessionTable({
  sessions,
  focusEndSessionId,
  onUpdate,
  onDelete,
  onAdd,
  onFocusConsumed,
}: {
  sessions: Session[];
  focusEndSessionId: string | null;
  onUpdate: (id: string, field: "startPage" | "endPage", value: number) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onFocusConsumed: () => void;
}) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>start page</th>
            <th>end page</th>
            <th>pages read</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session, index) => (
            <tr key={session.id} className="session-row">
              <td className="session-index-cell">
                <span className="session-index">{index + 1}</span>
                <button
                  className="delete-button"
                  type="button"
                  aria-label={`Delete session ${index + 1}`}
                  onClick={() => onDelete(session.id)}
                >
                  <Trash2 size={14} />
                </button>
              </td>
              <td>
                <InlineNumber
                  value={session.startPage}
                  ariaLabel={`Edit session ${index + 1} start page`}
                  onCommit={(value) => onUpdate(session.id, "startPage", value)}
                />
              </td>
              <td>
                <InlineNumber
                  value={session.endPage}
                  autoEdit={focusEndSessionId === session.id}
                  ariaLabel={`Edit session ${index + 1} end page`}
                  onCommit={(value) => onUpdate(session.id, "endPage", value)}
                  onAutoEdit={onFocusConsumed}
                />
              </td>
              <td className="computed-cell">{formatNumber(pagesRead(session))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-button" type="button" onClick={onAdd}>
        <Plus size={17} />
        add session
      </button>
    </div>
  );
}

function InlineNumber({
  value,
  onCommit,
  ariaLabel,
  className = "",
  autoEdit = false,
  onAutoEdit,
  render,
}: {
  value: number;
  onCommit: (value: number) => void;
  ariaLabel: string;
  className?: string;
  autoEdit?: boolean;
  onAutoEdit?: () => void;
  render?: (editing: boolean) => React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [editing, value]);

  useEffect(() => {
    if (!autoEdit) return;
    setEditing(true);
    onAutoEdit?.();
  }, [autoEdit, onAutoEdit]);

  const commit = () => {
    onCommit(parsePageInput(draft, value));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        className={`inline-input ${className}`}
        aria-label={ariaLabel}
        inputMode="decimal"
        autoFocus
        value={draft}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") {
            setDraft(String(value));
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className={`inline-value ${className}`}
      aria-label={ariaLabel}
      onClick={() => setEditing(true)}
    >
      {render?.(editing) ?? formatNumber(value)}
    </button>
  );
}

function DatePickerHeading({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => parseDateKey(value));
  const calendarDates = monthCalendarDates(visibleMonth);
  const visibleMonthIndex = visibleMonth.getMonth();

  useEffect(() => {
    if (!open) setVisibleMonth(parseDateKey(value));
  }, [open, value]);

  return (
    <div className="picker-shell">
      <button
        type="button"
        className="picker-trigger"
        aria-expanded={open}
        aria-label="Choose reading date"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="heading-label">{label}</span>
      </button>
      {open ? (
        <div className="picker-popover date-popover">
          <div className="picker-nav">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
            >
              <ChevronLeft size={16} />
            </button>
            <strong>{formatMonthLabel(visibleMonth)}</strong>
            <button
              type="button"
              aria-label="Next month"
              disabled={toDateKey(addMonths(visibleMonth, 1)) > TODAY_KEY}
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="calendar-weekdays">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {calendarDates.map((date) => {
              const dateKey = toDateKey(date);
              const isFuture = dateKey > TODAY_KEY;
              return (
                <button
                  key={dateKey}
                  type="button"
                  disabled={isFuture}
                  className={[
                    "calendar-day",
                    dateKey === value ? "is-selected" : "",
                    date.getMonth() !== visibleMonthIndex ? "is-muted" : "",
                    isFuture ? "is-disabled" : "",
                  ].join(" ")}
                  onClick={() => {
                    if (isFuture) return;
                    onChange(dateKey);
                    setOpen(false);
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="picker-footer">
            <button
              type="button"
              className="today-jump"
              onClick={() => {
                setVisibleMonth(parseDateKey(TODAY_KEY));
                onChange(TODAY_KEY);
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WeekPickerHeading({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const weekStart = dateKeysForWeek(value)[0];
  const weekOptions = [-2, -1, 0, 1, 2].map((offset) => {
    const dateKey = addDays(weekStart, offset * 7);
    const weekKey = toWeekKey(dateKey);
    const weekDates = dateKeysForWeek(weekKey);
    return {
      weekKey,
      weekNumber: weekNumberFromKey(weekKey),
      start: weekDates[0],
      end: weekDates[6],
      disabled: weekDates[0] > TODAY_KEY,
    };
  });

  return (
    <div className="picker-shell">
      <button
        type="button"
        className="picker-trigger"
        aria-expanded={open}
        aria-label="Choose reading week"
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </button>
      {open ? (
        <div className="picker-popover week-popover">
          <div className="picker-nav">
            <button
              type="button"
              aria-label="Previous week"
              onClick={() => onChange(toWeekKey(addDays(weekStart, -7)))}
            >
              <ChevronLeft size={16} />
            </button>
            <strong>{label}</strong>
            <button
              type="button"
              aria-label="Next week"
              disabled={dateKeysForWeek(toWeekKey(addDays(weekStart, 7)))[0] > TODAY_KEY}
              onClick={() => onChange(toWeekKey(addDays(weekStart, 7)))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="week-list">
            {weekOptions.map((option) => (
              <button
                key={option.weekKey}
                type="button"
                disabled={option.disabled}
                className={option.weekKey === value ? "is-selected" : ""}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.weekKey);
                  setOpen(false);
                }}
              >
                <span>W{option.weekNumber}</span>
                <small>
                  <span>{formatShortDate(option.start)}</span>
                  <span>{formatShortDate(option.end)}</span>
                </small>
              </button>
            ))}
          </div>
          <div className="picker-footer">
            <button
              type="button"
              className="today-jump"
              onClick={() => {
                onChange(toWeekKey(TODAY_KEY));
                setOpen(false);
              }}
            >
              This week
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChartPanel({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="chart-card">
      <div className="chart-heading">
        <h3>{title}</h3>
        <span>{caption}</span>
      </div>
      {children}
    </section>
  );
}

function WeeklySummary({
  days,
  selectedDate,
  onSelectDate,
}: {
  days: DayRecord[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
}) {
  return (
    <div className="summary-card">
      <table>
        <thead>
          <tr>
            <th>day</th>
            <th>sessions</th>
            <th>pages read</th>
            <th>reading rate</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => {
            const total = dayTotal(day);
            const isFuture = day.dateKey > TODAY_KEY;
            return (
              <tr
                key={day.dateKey}
                className={[
                  day.dateKey === selectedDate ? "is-selected" : "",
                  isFuture ? "is-future" : "",
                ].join(" ")}
                role="button"
                aria-disabled={isFuture}
                tabIndex={isFuture ? -1 : 0}
                onClick={() => {
                  if (!isFuture) onSelectDate(day.dateKey);
                }}
                onKeyDown={(event) => {
                  if (!isFuture && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onSelectDate(day.dateKey);
                  }
                }}
              >
                <td>{day.label}</td>
                <td>{day.sessions.length || "-"}</td>
                <td>{total ? formatNumber(total) : "-"}</td>
                <td>{readingRate(total, day.sessions.length)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      <span>{formatNumber(payload[0].value)} pages</span>
    </div>
  );
}
