import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  formatMinimalDate,
  formatMonthYear,
  fromDateKey,
  isFutureDate,
  toDateKey,
  todayKey,
} from "../utils/date";
import { TodayButton } from "./Buttons";

type DatePickerProps = {
  selectedDate: string;
  onChange: (dateKey: string) => void;
};

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

export function DatePicker({ selectedDate, onChange }: DatePickerProps) {
  const today = todayKey();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = fromDateKey(selectedDate);
    date.setDate(1);
    return toDateKey(date);
  });

  useEffect(() => {
    const date = fromDateKey(selectedDate);
    date.setDate(1);
    setVisibleMonth(toDateKey(date));
  }, [selectedDate]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const days = useMemo(() => {
    const first = fromDateKey(visibleMonth);
    const cursor = new Date(first);
    cursor.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, () => {
      const dateKey = toDateKey(cursor);
      const inMonth = cursor.getMonth() === first.getMonth();
      cursor.setDate(cursor.getDate() + 1);
      return { dateKey, inMonth };
    });
  }, [visibleMonth]);

  const changeMonth = (months: number) => {
    const next = fromDateKey(visibleMonth);
    next.setMonth(next.getMonth() + months);
    next.setDate(1);
    setVisibleMonth(toDateKey(next));
  };

  const selectDate = (dateKey: string) => {
    if (!isFutureDate(dateKey)) {
      onChange(dateKey);
      setOpen(false);
    }
  };

  return (
    <div className="picker-row" ref={pickerRef}>
      <div className="custom-picker">
        <button
          className="picker-trigger"
          type="button"
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          aria-expanded={open}
          aria-label="Select reading date"
        >
          <CalendarDays size={16} aria-hidden="true" />
          {formatMinimalDate(selectedDate)}
        </button>
        {open ? (
          <div className="picker-popover" role="dialog" aria-label="Date picker">
            <div className="picker-popover-header">
              <button className="icon-button" type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <strong>{formatMonthYear(visibleMonth)}</strong>
              <button
                className="icon-button"
                type="button"
                onClick={() => changeMonth(1)}
                disabled={fromDateKey(addDays(visibleMonth, 32)).getTime() > fromDateKey(today).getTime()}
                aria-label="Next month"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="calendar-grid calendar-weekdays" aria-hidden="true">
              {weekdays.map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {days.map(({ dateKey, inMonth }) => (
                <button
                  className="calendar-day"
                  type="button"
                  key={dateKey}
                  disabled={isFutureDate(dateKey)}
                  data-muted={!inMonth}
                  data-selected={dateKey === selectedDate}
                  onClick={() => selectDate(dateKey)}
                >
                  {fromDateKey(dateKey).getDate()}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {selectedDate !== today ? <TodayButton onClick={() => selectDate(today)} /> : null}
    </div>
  );
}
