import React from "react";
import Selector from "../common/Selector";

export type BootswatchTheme =
  | "cyborg"
  | "vapor"
  | "journal"
  | "solar"
  | "superhero"
  | "minty"
  | "quartz";

interface ThemeSelectorProps {
  currentTheme: BootswatchTheme;
  onThemeChange: (theme: BootswatchTheme) => void;
}

const THEME_OPTIONS = [
  { value: "cyborg", label: "Cyborg" },
  { value: "superhero", label: "Superhero" },
  { value: "vapor", label: "Vapor" },
  { value: "solar", label: "Solar" },
  { value: "quartz", label: "Quartz" },
  { value: "journal", label: "Journal" },
] as const;

// TODO
// Quartz bootwatch theme
// LiChess themes
const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  return (
    <Selector
      id="theme-selector"
      value={currentTheme}
      onChange={onThemeChange}
      options={THEME_OPTIONS}
      ariaLabel="Theme Selection"
    />
  );
};

export default ThemeSelector;
