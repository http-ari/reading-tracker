export type Session = {
  id: string;
  startPage: number;
  endPage: number;
};

export type DayRecord = {
  dateKey: string;
  label: string;
  shortLabel: string;
  sessions: Session[];
};

export type ReadingState = {
  dailyGoal: number;
  weeklyGoal: number;
  selectedDate: string;
  selectedWeek: string;
  sessionsByDate: Record<string, Session[]>;
};
