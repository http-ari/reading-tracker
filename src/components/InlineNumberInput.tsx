import { useEffect, useRef, useState } from "react";
import { formatNumber } from "../utils/reading";

type InlineNumberInputProps = {
  value: number;
  onCommit: (value: number) => void;
  ariaLabel: string;
  suffix?: string;
  autoEdit?: boolean;
  focusToken?: string;
};

export function InlineNumberInput({
  value,
  onCommit,
  ariaLabel,
  suffix,
  autoEdit = false,
  focusToken,
}: InlineNumberInputProps) {
  const [editing, setEditing] = useState(autoEdit);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(String(value));
    }
  }, [editing, value]);

  useEffect(() => {
    if (autoEdit) {
      setEditing(true);
    }
  }, [autoEdit, focusToken]);

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, focusToken]);

  const commit = () => {
    const next = Number(draft);
    if (Number.isFinite(next)) {
      onCommit(next);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="inline-input"
        aria-label={ariaLabel}
        inputMode="decimal"
        type="number"
        step="0.01"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setDraft(String(value));
            setEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      className="inline-value"
      type="button"
      aria-label={ariaLabel}
      onClick={() => setEditing(true)}
      onFocus={() => setEditing(true)}
    >
      {formatNumber(value)}
      {suffix ? <span>{suffix}</span> : null}
    </button>
  );
}
