import React, { useEffect } from "react";
import "./ThemeSelector.css";

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

// TODO
// Quartz bootwatch theme
// LiChess themes
const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    currentTheme,
    onThemeChange,
}) => {
    return (
        <div className="selector-wrapper">
            <label className="selector-label text-info">Theme</label>
            <div className="selector-container">
                <select
                    id="theme-selector"
                    value={currentTheme}
                    onChange={(e) =>
                        onThemeChange(e.target.value as BootstrapTheme)
                    }
                    className="select-control btn btn-info"
                    aria-label="Theme Selection"
                >
                    <option value="cyborg">Cyborg</option>
                    <option value="vapor">Vapor</option>
                    <option value="journal">Journal</option>
                    <option value="solar">Solar</option>
                    <option value="superhero">Superhero</option>
                    <option value="minty">Minty</option>
                </select>
            </div>
        </div>
    );
};

export default ThemeSelector;
