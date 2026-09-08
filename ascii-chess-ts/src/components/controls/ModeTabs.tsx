import React from "react";

type SetupMode = "play" | "analysis";

interface ModeTabsProps {
  mode: SetupMode;
  onModeChange: (mode: SetupMode) => void;
}

const ModeTabs: React.FC<ModeTabsProps> = ({ mode, onModeChange }) => {
  return (
    <div className="mode-tabs">
      <button
        className={`tab ${mode === "analysis" ? "active" : ""}`}
        onClick={() => onModeChange("analysis")}
      >
        Sandbox
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
