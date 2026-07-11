import type { ReadingState, Session, WeekDaySummary } from "../types";
import { normalizeBackground, readStoredBackground } from "../theme";
import { formatDayName, formatShortDate, getWeekDays, isFutureDate, startOfWeek, todayKey } from "./date";

export function pageCount(session: Session) {
  return session.endPage - session.startPage + 1;
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value);
}

export function sumPages(sessions: Session[] = []) {
  return sessions.reduce((total, session) => total + pageCount(session), 0);
}

export function getDailyTotal(state: ReadingState, dateKey = state.selectedDate) {
  return sumPages(state.sessionsByDate[dateKey] || []);
}

export function getWeeklySummaries(state: ReadingState, weekStart = state.selectedWeek): WeekDaySummary[] {
  return getWeekDays(weekStart).map((dateKey) => {
    const sessions = state.sessionsByDate[dateKey] || [];
    const pages = sumPages(sessions);
    return {
      dateKey,
      label: formatDayName(dateKey),
      shortLabel: formatShortDate(dateKey),
      sessions: sessions.length,
      pages,
      rate: sessions.length ? pages / sessions.length : null,
      isFuture: isFutureDate(dateKey),
    };
  });
}

export function getWeeklyTotal(state: ReadingState, weekStart = state.selectedWeek) {
  return getWeeklySummaries(state, weekStart).reduce((total, day) => total + day.pages, 0);
}

export function createEmptyState(): ReadingState {
  const today = todayKey();
  return {
    dailyGoal: 25,
    weeklyGoal: 125,
    background: readStoredBackground(),
    selectedDate: today,
    selectedWeek: startOfWeek(today),
    sessionsByDate: {},
  };
}

export function normalizeState(raw: Partial<ReadingState> | null): ReadingState {
  const empty = createEmptyState();
  if (!raw || typeof raw !== "object") {
    return empty;
  }

  const selectedDate = raw.selectedDate || empty.selectedDate;
  const selectedWeek = raw.selectedWeek || startOfWeek(selectedDate);
  return {
    dailyGoal: Number.isFinite(raw.dailyGoal) ? Number(raw.dailyGoal) : empty.dailyGoal,
    weeklyGoal: Number.isFinite(raw.weeklyGoal) ? Number(raw.weeklyGoal) : empty.weeklyGoal,
    background: normalizeBackground(raw.background || empty.background),
    selectedDate,
    selectedWeek,
    sessionsByDate: raw.sessionsByDate || {},
  };
}
