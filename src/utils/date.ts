const dayMs = 24 * 60 * 60 * 1000;

export function toDateKey(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const year = copy.getFullYear();
  const month = String(copy.getMonth() + 1).padStart(2, "0");
  const day = String(copy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey() {
  return toDateKey(new Date());
}

export function addDays(dateKey: string, days: number) {
  const date = fromDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function startOfWeek(dateKey: string) {
  const date = fromDateKey(dateKey);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return toDateKey(date);
}

export function getWeekDays(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function isFutureDate(dateKey: string) {
  return fromDateKey(dateKey).getTime() > fromDateKey(todayKey()).getTime();
}

export function isFutureWeek(weekStart: string) {
  return fromDateKey(weekStart).getTime() > fromDateKey(startOfWeek(todayKey())).getTime();
}

export function formatLongDate(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(fromDateKey(dateKey));
}

export function formatMinimalDate(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(fromDateKey(dateKey));
}

export function formatMonthYear(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(fromDateKey(dateKey));
}

export function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(fromDateKey(dateKey));
}

export function formatDayName(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(fromDateKey(dateKey));
}

export function getIsoWeekNumber(dateKey: string) {
  const date = fromDateKey(dateKey);
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const working = new Date(utc);
  const day = working.getUTCDay() || 7;
  working.setUTCDate(working.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(working.getUTCFullYear(), 0, 1));
  return Math.ceil(((working.getTime() - yearStart.getTime()) / dayMs + 1) / 7);
}

export function formatWeekRange(weekStart: string) {
  const start = fromDateKey(weekStart);
  const end = fromDateKey(addDays(weekStart, 6));
  const sameMonth = start.getMonth() === end.getMonth();
  const startText = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(start);
  const endText = new Intl.DateTimeFormat(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  }).format(end);
  return `${startText} - ${endText}`;
}

export function formatMinimalWeek(weekStart: string) {
  const start = fromDateKey(weekStart);
  const end = fromDateKey(addDays(weekStart, 6));
  const sameMonth = start.getMonth() === end.getMonth();
  const startText = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(start);
  const endText = new Intl.DateTimeFormat(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  }).format(end);
  return `Week ${getIsoWeekNumber(weekStart)} · ${startText}-${endText}`;
}

export function toWeekInputValue(weekStart: string) {
  const date = fromDateKey(weekStart);
  const week = String(getIsoWeekNumber(weekStart)).padStart(2, "0");
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + 3);
  return `${thursday.getFullYear()}-W${week}`;
}

export function fromWeekInputValue(value: string) {
  const [yearPart, weekPart] = value.split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);
  const janFourth = new Date(year, 0, 4);
  const janFourthWeekStart = startOfWeek(toDateKey(janFourth));
  return addDays(janFourthWeekStart, (week - 1) * 7);
}
