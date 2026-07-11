"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import {
  applyAppTheme,
  getStoredAppTheme,
  storeAppTheme,
  type AppTheme,
} from "@/lib/app-theme";

const ThemeContext = createContext<{
  theme: AppTheme;
  toggleTheme: () => void;
} | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>("light");

  useLayoutEffect(() => {
    const initial = getStoredAppTheme();
    setTheme(initial);
    applyAppTheme(initial);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: AppTheme = prev === "dark" ? "light" : "dark";
      storeAppTheme(next);
      applyAppTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
}
