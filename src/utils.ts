import type { DayRecord, Session } from "./types";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "long" });
const shortDayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

export const pagesRead = (session: Session) =>
  session.endPage >= session.startPage
    ? Math.max(0, roundNumber(session.endPage - session.startPage + 1))
    : 0;

export const dayTotal = (day: DayRecord) =>
  roundNumber(day.sessions.reduce((sum, session) => sum + pagesRead(session), 0));

export const weeklyTotal = (days: DayRecord[]) =>
  roundNumber(days.reduce((sum, day) => sum + dayTotal(day), 0));

export const readingRate = (pages: number, sessions: number) => {
  if (!sessions || pages <= 0) return "-";
  return `${formatNumber(pages / sessions)} p / 50 min`;
};

export const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(roundNumber(value));
};

export const roundNumber = (value: number) => Math.round(value * 100) / 100;

export const parsePageInput = (value: string, fallback: number) => {
  const next = Number.parseFloat(value);
  return Number.isFinite(next) ? roundNumber(next) : fallback;
};

export const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateLabel = (dateKey: string) =>
  dateFormatter.format(parseDateKey(dateKey)).replace(",", "");

export const formatDayLabel = (dateKey: string) => dayFormatter.format(parseDateKey(dateKey));

export const formatShortDayLabel = (dateKey: string) =>
  shortDayFormatter.format(parseDateKey(dateKey));

export const formatMonthLabel = (date: Date) => monthFormatter.format(date);

export const formatShortDate = (dateKey: string) => shortDateFormatter.format(parseDateKey(dateKey));

export const getISOWeek = (date: Date) => {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNumber = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNumber + 3);
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);
};

export const getISOWeekYear = (date: Date) => {
  const target = new Date(date.valueOf());
  target.setDate(target.getDate() - ((date.getDay() + 6) % 7) + 3);
  return target.getFullYear();
};

export const toWeekKey = (dateKey: string) => {
  const date = parseDateKey(dateKey);
  return `${getISOWeekYear(date)}-W${String(getISOWeek(date)).padStart(2, "0")}`;
};

export const weekNumberFromKey = (weekKey: string) => Number(weekKey.split("-W")[1] ?? 1);

export const startOfISOWeek = (weekKey: string) => {
  const [yearText, weekText] = weekKey.split("-W");
  const year = Number(yearText);
  const week = Number(weekText);
  const fourthOfJanuary = new Date(year, 0, 4);
  const mondayOfWeekOne = new Date(fourthOfJanuary);
  mondayOfWeekOne.setDate(fourthOfJanuary.getDate() - ((fourthOfJanuary.getDay() + 6) % 7));
  const weekStart = new Date(mondayOfWeekOne);
  weekStart.setDate(mondayOfWeekOne.getDate() + (week - 1) * 7);
  return weekStart;
};

export const dateKeysForWeek = (weekKey: string) => {
  const weekStart = startOfISOWeek(weekKey);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return toDateKey(date);
  });
};

export const addDays = (dateKey: string, amount: number) => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
};

export const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export const monthCalendarDates = (date: Date) => {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
};
