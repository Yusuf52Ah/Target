"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const THEME_KEY = "targetuz_theme";
type ThemeMode = "dark" | "light";

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const isHydrated = useIsHydrated();
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    applyTheme(theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage write errors (e.g. privacy mode).
    }
  }, [theme, isHydrated]);

  const handleToggle = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800/70"
      aria-label="Rang sxemasini almashtirish"
      title="Dark/Light rejim"
    >
      {isHydrated ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme"}
    </button>
  );
}
