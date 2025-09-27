import React from "react";
import { BootstrapTheme } from "./ThemeSelector";

type SetupMode = "analysis" | "play";

interface ModeTabsProps {
  mode: SetupMode;
  theme: BootstrapTheme;
  onModeChange: (mode: SetupMode) => void;
}

const ModeTabs: React.FC<ModeTabsProps> = ({ mode, theme, onModeChange }) => {
  return (
    <div className="mode-tabs">
      <button
        className={`tab ${mode === "analysis" ? "active" : ""}`}
        onClick={() => onModeChange("analysis")}
      >
        Custom
      </button>
      <button
        className={`tab ${mode === "play" ? "active" : ""}`}
        onClick={() => onModeChange("play")}
      >
        Lichess
      </button>
    </div>
  );
};

export default ModeTabs;
