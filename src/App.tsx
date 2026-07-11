import { ArrowLeft, Home } from "lucide-react";
import { useEffect } from "react";
import { ComponentsPage } from "./screens/ComponentsPage";
import { TrackerPage } from "./screens/TrackerPage";
import { useReadingState } from "./hooks/useReadingState";
import { backgroundStorageKey } from "./theme";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return Boolean(target.closest("input, textarea, select, button, a, [contenteditable='true']"));
}

function getRoute() {
  const redirectedPath = new URLSearchParams(window.location.search).get("p");
  if (redirectedPath) {
    const url = new URL(window.location.href);
    url.searchParams.delete("p");
    window.history.replaceState(null, "", redirectedPath);
    return redirectedPath;
  }
  return window.location.pathname;
}

export default function App() {
  const route = getRoute();
  const isComponents = route.endsWith("/components");
  const { state, ready, actions } = useReadingState();

  useEffect(() => {
    document.documentElement.dataset.background = state.background;
    localStorage.setItem(backgroundStorageKey, state.background);
  }, [state.background]);

  useEffect(() => {
    if (isComponents) {
      return undefined;
    }

    const openComponents = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "c" ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isEditableTarget(event.target)
      ) {
        return;
      }
      event.preventDefault();
      window.location.href = "./components";
    };

    window.addEventListener("keydown", openComponents);
    return () => window.removeEventListener("keydown", openComponents);
  }, [isComponents]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="./" aria-label="Open Reading Tracker home">
          <Home size={21} aria-hidden="true" />
          <span>Reading Tracker</span>
        </a>
        <nav aria-label="Primary navigation">
          {isComponents ? (
            <a className="nav-link" href="./">
              <ArrowLeft size={16} aria-hidden="true" />
              Tracker
            </a>
          ) : null}
        </nav>
      </header>
      {isComponents ? (
        <ComponentsPage background={state.background} onBackgroundChange={actions.setBackground} />
      ) : (
        <TrackerPage state={state} ready={ready} actions={actions} />
      )}
    </div>
  );
}
