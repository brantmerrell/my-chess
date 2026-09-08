import React from "react";

export type ThemeMode = "light" | "dark";

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      id="theme-selector"
      className="button is-small"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      onClick={() => onThemeChange(isDark ? "light" : "dark")}
    >
      {isDark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};

export default ThemeSelector;
