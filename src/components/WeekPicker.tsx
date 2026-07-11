import { CalendarRange } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  addDays,
  formatMinimalWeek,
  formatWeekRange,
  getIsoWeekNumber,
  isFutureWeek,
  startOfWeek,
  todayKey,
} from "../utils/date";

type WeekPickerProps = {
  selectedWeek: string;
  onChange: (weekStart: string) => void;
};

export function WeekPicker({ selectedWeek, onChange }: WeekPickerProps) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const currentWeek = startOfWeek(todayKey());
  const weekOptions = Array.from({ length: 9 }, (_, index) => addDays(selectedWeek, (index - 4) * 7));

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

  const selectWeek = (weekStart: string) => {
    if (!isFutureWeek(weekStart)) {
      onChange(weekStart);
      setOpen(false);
    }
  };

  return (
    <div className="week-controls">
      <div className="custom-picker" ref={pickerRef}>
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
          aria-label="Select reading week"
        >
          <CalendarRange size={16} aria-hidden="true" />
          {formatMinimalWeek(selectedWeek)}
        </button>
        {open ? (
          <div className="picker-popover week-popover" role="dialog" aria-label="Week picker">
            <div className="picker-popover-header">
              <strong>Choose week</strong>
              {selectedWeek !== currentWeek ? (
                <button className="picker-small-button" type="button" onClick={() => selectWeek(currentWeek)}>
                  Current
                </button>
              ) : null}
            </div>
            <div className="week-list">
              {weekOptions.map((weekStart) => (
                <button
                  type="button"
                  key={weekStart}
                  className="week-option"
                  disabled={isFutureWeek(weekStart)}
                  data-selected={weekStart === selectedWeek}
                  onClick={() => selectWeek(weekStart)}
                >
                  <span>Week {getIsoWeekNumber(weekStart)}</span>
                  <small>{formatWeekRange(weekStart)}</small>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
