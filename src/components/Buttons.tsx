import { CalendarDays, Plus } from "lucide-react";

type ButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  ariaKeyShortcuts?: string;
};

export function TodayButton({ onClick, label = "Today" }: ButtonProps) {
  return (
    <button className="button secondary" type="button" onClick={onClick}>
      <CalendarDays size={16} aria-hidden="true" />
      {label}
    </button>
  );
}

export function AddSessionButton({ onClick, disabled = false, ariaKeyShortcuts }: ButtonProps) {
  return (
    <button
      className="button primary"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-keyshortcuts={ariaKeyShortcuts}
    >
      <Plus size={16} aria-hidden="true" />
      Add session
    </button>
  );
}
