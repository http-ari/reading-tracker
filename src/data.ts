import type { ReadingState } from "./types";

export const STORAGE_KEY = "law-reading-tracker-state-v7";

export const initialState: ReadingState = {
  dailyGoal: 50,
  weeklyGoal: 300,
  selectedDate: "2026-07-07",
  selectedWeek: "2026-W28",
  sessionsByDate: {
    "2026-07-07": [
      { id: "sample-1", startPage: 25, endPage: 32 },
      { id: "sample-2", startPage: 32, endPage: 40 },
    ],
  },
};
