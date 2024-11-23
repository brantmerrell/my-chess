import React from "react";
import "./SelectStyle.css";

type ViewType = "board" | "graph" | "arc" | "chord" | "history" | "fencount";

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
            <label className="selector-label">Game View</label>
            <div className="selector-container">
                <select
                    value={selectedView}
                    onChange={(e) => onViewChange(e.target.value as ViewType)}
                    className="select-control"
                    aria-label="Game View Selection"
                >
                    <option value="board">Board</option>
                    <option value="graph">Graph</option>
                    <option value="arc">Arc</option>
                    <option value="chord">Chord</option>
                    <option value="history">History</option>
                    <option value="fencount">Line</option>
                </select>
            </div>
        </div>
    );
};

export default ViewSelector;
