import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "../types";
import { formatNumber, pageCount } from "../utils/reading";
import { AddSessionButton } from "./Buttons";
import { InlineNumberInput } from "./InlineNumberInput";

type EditableSessionField = "startPage" | "endPage";

type SessionTableProps = {
  sessions: Session[];
  onAdd: () => string;
  onUpdate: (sessionId: string, field: EditableSessionField, value: number) => void;
  onDelete: (sessionId: string) => void;
  enableKeyboardShortcut?: boolean;
};

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(target.closest("input, textarea, select, button, [contenteditable='true']"));
}

export function SessionTable({ sessions, onAdd, onUpdate, onDelete, enableKeyboardShortcut = false }: SessionTableProps) {
  const [autoEdit, setAutoEdit] = useState<{ sessionId: string; field: EditableSessionField; token: string } | null>(null);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  const handleAdd = useCallback(() => {
    const field: EditableSessionField = sessions.length === 0 ? "startPage" : "endPage";
    const sessionId = onAdd();
    setAutoEdit({ sessionId, field, token: `${sessionId}-${field}-${Date.now()}` });
    if (enableKeyboardShortcut) {
      setShowAddedToast(true);
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setShowAddedToast(false), 1400);
    }
  }, [enableKeyboardShortcut, onAdd, sessions.length]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!enableKeyboardShortcut) {
      return undefined;
    }

    const addWithShortcut = (event: KeyboardEvent) => {
      if (
        event.key !== "Enter" ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }
      event.preventDefault();
      handleAdd();
    };

    window.addEventListener("keydown", addWithShortcut);
    return () => window.removeEventListener("keydown", addWithShortcut);
  }, [enableKeyboardShortcut, handleAdd]);

  return (
    <div className="table-block">
      {enableKeyboardShortcut && showAddedToast ? (
        <div className="toast" role="status" aria-live="polite">
          Session added
        </div>
      ) : null}
      <div className="table-scroll">
        <table>
          <caption>Reading sessions for selected date</caption>
          <thead>
            <tr>
              <th scope="col">Session</th>
              <th scope="col">Start page</th>
              <th scope="col">End page</th>
              <th scope="col">Pages read</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length ? (
              sessions.map((session, index) => (
                <tr key={session.id}>
                  <th scope="row">{index + 1}</th>
                  <td>
                    <InlineNumberInput
                      value={session.startPage}
                      onCommit={(value) => onUpdate(session.id, "startPage", value)}
                      ariaLabel={`Edit start page for session ${index + 1}`}
                      autoEdit={autoEdit?.sessionId === session.id && autoEdit.field === "startPage"}
                      focusToken={autoEdit?.field === "startPage" ? autoEdit.token : undefined}
                    />
                  </td>
                  <td>
                    <InlineNumberInput
                      value={session.endPage}
                      onCommit={(value) => onUpdate(session.id, "endPage", value)}
                      ariaLabel={`Edit end page for session ${index + 1}`}
                      autoEdit={autoEdit?.sessionId === session.id && autoEdit.field === "endPage"}
                      focusToken={autoEdit?.field === "endPage" ? autoEdit.token : undefined}
                    />
                  </td>
                  <td className="row-action-cell">
                    <span>{formatNumber(pageCount(session))}</span>
                    <button
                      className="icon-button danger row-delete"
                      type="button"
                      onClick={() => onDelete(session.id)}
                      aria-label={`Delete session ${index + 1}`}
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  <div className="empty-row">Add a session to start tracking this date.</div>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>
                <div className="table-add-row">
                  <AddSessionButton onClick={handleAdd} ariaKeyShortcuts={enableKeyboardShortcut ? "Enter" : undefined} />
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
