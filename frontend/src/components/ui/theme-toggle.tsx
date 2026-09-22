"use client";

import { useSyncExternalStore } from "react";
import styles from "./theme-toggle.module.css";

type Theme = "light" | "dark";

const THEME_KEY = "vyntics-theme";
const THEME_EVENT = "vyntics-theme-change";

function getTheme(): Theme {
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function subscribe(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_EVENT, onStoreChange);
  };
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.1 15.1A8.4 8.4 0 0 1 8.9 3.9 8.5 8.5 0 1 0 20.1 15.1Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3.75" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme: Theme = isDark ? "light" : "dark";

    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // The theme still works for this page when storage is unavailable.
    }

    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      className={styles.toggle}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
    >
      <span className={styles.icon}>{isDark ? <SunIcon /> : <MoonIcon />}</span>
    </button>
  );
}
