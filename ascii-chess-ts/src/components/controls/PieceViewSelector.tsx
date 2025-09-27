import React from "react";
import { PieceDisplayMode } from "../../types/chess";
import "./PieceViewSelector.css";

interface PieceViewSelectorProps {
  displayMode: PieceDisplayMode;
  onDisplayModeChange: (mode: PieceDisplayMode) => void;
}

const PIECE_VIEW_OPTIONS = [
  { value: "full", label: "[♚♛♜♝♞♟]" },
  { value: "symbols", label: "(♔♕♖♗♘♙)" },
  { value: "letters", label: "(KQRBNP)" },
  { value: "masked", label: "(******)" },
] as const;

const PieceViewSelector: React.FC<PieceViewSelectorProps> = ({
  displayMode,
  onDisplayModeChange,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">
        <u>P</u>iece View
      </label>
      <div className="piece-view-button-group">
        {PIECE_VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`piece-view-button ${
              displayMode === option.value ? "active" : ""
            }`}
            onClick={() =>
              onDisplayModeChange(option.value as PieceDisplayMode)
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PieceViewSelector;
