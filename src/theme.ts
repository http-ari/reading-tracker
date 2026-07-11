export type BackgroundKey = "dark" | "warm" | "lightBlue" | "paperShade";

export const backgroundStorageKey = "reading-tracker-background";

export const backgroundOptions: Array<{
  key: BackgroundKey;
  label: string;
  value: string;
  description: string;
}> = [
  {
    key: "dark",
    label: "Pressed line",
    value: "#161827",
    description: "Default Pressed line background with subtle notebook rules.",
  },
  {
    key: "warm",
    label: "Warm pressed line",
    value: "#cdbd9e",
    description: "Lighter, warmer background with a softer notebook feel.",
  },
  {
    key: "lightBlue",
    label: "Light ink blue",
    value: "#d8dfef",
    description: "A pale blue ink wash for a lighter background mode.",
  },
  {
    key: "paperShade",
    label: "Paper shade",
    value: "#eee7d8",
    description: "A quiet background shade made to sit close to the card colour.",
  },
];

export function isBackgroundKey(value: unknown): value is BackgroundKey {
  return value === "warm" || value === "dark" || value === "lightBlue" || value === "paperShade";
}

export function normalizeBackground(value: unknown): BackgroundKey {
  return isBackgroundKey(value) ? value : "dark";
}

export function readStoredBackground(): BackgroundKey {
  const stored = localStorage.getItem(backgroundStorageKey);
  return normalizeBackground(stored);
}
