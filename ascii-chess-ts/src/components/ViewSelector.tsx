import React from "react";
import "./SelectStyle.css";

type PositionalViewType = "board" | "graph" | "arc" | "chord";
type HistoricalViewType = "history" | "fencount"; // "historicalArc" | 

interface PositionalViewSelectorProps {
    selectedView: PositionalViewType;
    onViewChange: (view: PositionalViewType) => void;
}

interface HistoricalViewSelectorProps {
    selectedView: HistoricalViewType;
    onViewChange: (view: HistoricalViewType) => void;
}

export const PositionalViewSelector: React.FC<PositionalViewSelectorProps> = ({
    selectedView,
    onViewChange,
}) => {
    return (
        <div className="selector-wrapper">
            <label className="selector-label text-info">Positional View</label>
            <div className="selector-container">
                <select
                    value={selectedView}
                    id="positional-view-selector"
                    onChange={(e) => onViewChange(e.target.value as PositionalViewType)}
                    className="select-control btn btn-info"
                    aria-label="Positional View Selection"
                >
                    <option value="board">Board</option>
                    <option value="graph">Graph</option>
                    <option value="arc">Arc</option>
                    <option value="chord">Chord</option>
                </select>
            </div>
        </div>
    );
};

export const HistoricalViewSelector: React.FC<HistoricalViewSelectorProps> = ({
    selectedView,
    onViewChange,
}) => {
    return (
        <div className="selector-wrapper">
            <label className="selector-label text-info">Historical View</label>
            <div className="selector-container">
                <select
                    value={selectedView}
                    id="historical-view-selector"
                    onChange={(e) => onViewChange(e.target.value as HistoricalViewType)}
                    className="select-control btn btn-info"
                    aria-label="Historical View Selection"
                >
                    <option value="history">History</option>
                    <option value="fencount">Line</option>
                </select>
            </div>
        </div>
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
