import type { ReadingState } from "../types";
import { normalizeState } from "./reading";

const storageKey = "reading-tracker-state";

async function readRemoteState() {
  const response = await fetch("/api/reading-state");
  if (!response.ok) {
    throw new Error("Remote sync unavailable");
  }
  return (await response.json()) as Partial<ReadingState> | null;
}

async function writeRemoteState(state: ReadingState) {
  const response = await fetch("/api/reading-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!response.ok) {
    throw new Error("Remote sync unavailable");
  }
}

export async function loadState() {
  const localRaw = localStorage.getItem(storageKey);
  const localState = localRaw ? normalizeState(JSON.parse(localRaw) as Partial<ReadingState>) : null;

  try {
    const remote = await readRemoteState();
    if (remote) {
      const state = normalizeState(remote);
      localStorage.setItem(storageKey, JSON.stringify(state));
      return state;
    }
  } catch {
    if (localState) {
      return localState;
    }
  }

  return localState || normalizeState(null);
}

export async function saveState(state: ReadingState) {
  localStorage.setItem(storageKey, JSON.stringify(state));
  try {
    await writeRemoteState(state);
  } catch {
    // Static deployments intentionally fall back to browser storage.
  }
}
