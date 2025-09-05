import React from "react";
import Selector from "./Selector";

// I think BootstrapTheme should be called BootswatchTheme
export type BootstrapTheme =
    | "cyborg"
    | "vapor"
    | "journal"
    | "solar"
    | "superhero"
    | "minty";

interface ThemeSelectorProps {
    currentTheme: BootstrapTheme;
    onThemeChange: (theme: BootstrapTheme) => void;
}

const THEME_OPTIONS = [
    { value: "cyborg", label: "Cyborg" },
    { value: "vapor", label: "Vapor" },
    { value: "journal", label: "Journal" },
    { value: "solar", label: "Solar" },
    { value: "superhero", label: "Superhero" },
    { value: "minty", label: "Minty" }
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
            label="Theme"
            value={currentTheme}
            onChange={onThemeChange}
            options={THEME_OPTIONS}
        />
    );
};

export default ThemeSelector;
