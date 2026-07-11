import type { BackgroundKey } from "./theme";

export type Session = {
  id: string;
  startPage: number;
  endPage: number;
};

export type ReadingState = {
  dailyGoal: number;
  weeklyGoal: number;
  background: BackgroundKey;
  selectedDate: string;
  selectedWeek: string;
  sessionsByDate: Record<string, Session[]>;
};

export type WeekDaySummary = {
  dateKey: string;
  label: string;
  shortLabel: string;
  sessions: number;
  pages: number;
  rate: number | null;
  isFuture: boolean;
};
