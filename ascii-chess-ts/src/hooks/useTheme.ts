import { useState, useLayoutEffect } from "react";
import type { ThemeMode } from "../components/controls/ThemeSelector";

const getInitialTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem("chess-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("chess-theme", theme);
  }, [theme]);

  return { theme, setTheme };
};
