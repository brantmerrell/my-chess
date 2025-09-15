import React from "react";
import Selector from "./Selector";

type PositionalViewType = "graph" | "board" | "arc" | "chord" | "graphdag";
type HistoricalViewType = "history" | "fencount"; // "historicalArc" |

interface PositionalViewSelectorProps {
  selectedView: PositionalViewType;
  onViewChange: (view: PositionalViewType) => void;
}

interface HistoricalViewSelectorProps {
  selectedView: HistoricalViewType;
  onViewChange: (view: HistoricalViewType) => void;
}

const POSITIONAL_VIEW_OPTIONS = [
  { value: "graph", label: "Graph" },
  { value: "board", label: "Board" },
  { value: "arc", label: "Arc" },
  { value: "chord", label: "Chord" },
  { value: "graphdag", label: "GraphDAG" },
] as const;

const HISTORICAL_VIEW_OPTIONS = [
  { value: "history", label: "History" },
  { value: "fencount", label: "Line" },
] as const;

export const PositionalViewSelector: React.FC<PositionalViewSelectorProps> = ({
  selectedView,
  onViewChange,
}) => {
  return (
    <Selector
      id="positional-view-selector"
      label={
        <span>
          Pos<u>i</u>tional View
        </span>
      }
      value={selectedView}
      onChange={onViewChange}
      options={POSITIONAL_VIEW_OPTIONS}
    />
  );
};

export const HistoricalViewSelector: React.FC<HistoricalViewSelectorProps> = ({
  selectedView,
  onViewChange,
}) => {
  return (
    <Selector
      id="historical-view-selector"
      label={
        <span>
          Hist<u>o</u>rical View
        </span>
      }
      value={selectedView}
      onChange={onViewChange}
      options={HISTORICAL_VIEW_OPTIONS}
    />
  );
};

// Keep the old ViewSelector for backwards compatibility for now
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
