import { useEffect, useState } from "react";
import type { ReadingState, Session } from "../types";
import type { BackgroundKey } from "../theme";
import { addDays, isFutureDate, isFutureWeek, startOfWeek, todayKey } from "../utils/date";
import { createEmptyState } from "../utils/reading";
import { loadState, saveState } from "../utils/storage";

function newId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useReadingState() {
  const [state, setState] = useState<ReadingState>(createEmptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadState().then((loaded) => {
      if (active) {
        setState(loaded);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (ready) {
      void saveState(state);
    }
  }, [ready, state]);

  const updateState = (updater: (current: ReadingState) => ReadingState) => {
    setState((current) => updater(current));
  };

  const setDailyGoal = (dailyGoal: number) => {
    updateState((current) => ({ ...current, dailyGoal }));
  };

  const setWeeklyGoal = (weeklyGoal: number) => {
    updateState((current) => ({ ...current, weeklyGoal }));
  };

  const setBackground = (background: BackgroundKey) => {
    updateState((current) => ({ ...current, background }));
  };

  const selectDate = (dateKey: string) => {
    if (isFutureDate(dateKey)) {
      return;
    }
    updateState((current) => ({
      ...current,
      selectedDate: dateKey,
      selectedWeek: startOfWeek(dateKey),
    }));
  };

  const selectWeek = (weekStart: string) => {
    if (isFutureWeek(weekStart)) {
      return;
    }
    updateState((current) => ({ ...current, selectedWeek: weekStart }));
  };

  const addSession = (dateKey: string) => {
    const createdSession: Session = { id: newId(), startPage: 1, endPage: 1 };
    updateState((current) => {
      const sessions = current.sessionsByDate[dateKey] || [];
      const previous = sessions.at(-1);
      const startPage = previous ? previous.endPage + 1 : 1;
      createdSession.startPage = startPage;
      createdSession.endPage = startPage;
      return {
        ...current,
        sessionsByDate: {
          ...current.sessionsByDate,
          [dateKey]: [...sessions, createdSession],
        },
      };
    });
    return createdSession.id;
  };

  const updateSession = (dateKey: string, sessionId: string, field: "startPage" | "endPage", value: number) => {
    updateState((current) => {
      const sessions = current.sessionsByDate[dateKey] || [];
      return {
        ...current,
        sessionsByDate: {
          ...current.sessionsByDate,
          [dateKey]: sessions.map((session) =>
            session.id === sessionId ? { ...session, [field]: value } : session,
          ),
        },
      };
    });
  };

  const deleteSession = (dateKey: string, sessionId: string) => {
    updateState((current) => ({
      ...current,
      sessionsByDate: {
        ...current.sessionsByDate,
        [dateKey]: (current.sessionsByDate[dateKey] || []).filter((session) => session.id !== sessionId),
      },
    }));
  };

  return {
    state,
    ready,
    actions: {
      setDailyGoal,
      setWeeklyGoal,
      setBackground,
      selectDate,
      selectWeek,
      addSession,
      updateSession,
      deleteSession,
      jumpToday: () => selectDate(todayKey()),
      jumpCurrentWeek: () => selectWeek(startOfWeek(todayKey())),
      previousWeek: () => selectWeek(addDays(state.selectedWeek, -7)),
      nextWeek: () => selectWeek(addDays(state.selectedWeek, 7)),
    },
  };
}
