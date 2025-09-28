import React from "react";
import Selector from "../common/Selector";
import "./HistoricalViewSelector.css";

type HistoricalViewType = "history" | "fencount"; // "historicalArc" |

interface HistoricalViewSelectorProps {
  selectedView: HistoricalViewType;
  onViewChange: (view: HistoricalViewType) => void;
}

const HISTORICAL_VIEW_OPTIONS = [
  { value: "history", label: "🮁" },
  { value: "fencount", label: "🗠" },
] as const;

export const HistoricalViewSelector: React.FC<HistoricalViewSelectorProps> = ({
  selectedView,
  onViewChange,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Historical View</label>
      <div className="historical-view-button-group">
        {HISTORICAL_VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`historical-view-button ${
              selectedView === option.value ? "active" : ""
            }`}
            onClick={() => onViewChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

type ViewType =
  | "board"
  | "graph"
  | "history"
  | "arc"
  | "historicalArc"
  | "chord"
  | "fencount";

interface ViewSelectorProps {
  selectedView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({
  selectedView,
  onViewChange,
}) => {
  return (
    <div className="selector-wrapper">
      <label className="selector-label text-info">Game View</label>
      <div className="selector-container">
        <select
          value={selectedView}
          id="game-view-selector"
          onChange={(e) => onViewChange(e.target.value as ViewType)}
          className="select-control btn btn-info"
          aria-label="Game View Selection"
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              // Simulate a click to open the dropdown
              e.currentTarget.click();
            }
          }}
        >
          <option value="board">Board</option>
          <option value="graph">Graph</option>
          <option value="history">History</option>
          <option value="arc">Arc</option>
          <option value="chord">Chord</option>
          <option value="fencount">Line</option>
        </select>
      </div>
    </div>
  );
};

export default ViewSelector;
