import React from "react";

export type BoardView = "grid" | "heatmap" | "none";

interface BoardViewControlsProps {
  flipBoard: boolean;
  showGrid: boolean;
  heatmap: boolean;
  onFlipBoardChange: (flipped: boolean) => void;
  onBoardViewChange: (view: BoardView) => void;
}

const BoardViewControls: React.FC<BoardViewControlsProps> = ({
  flipBoard,
  showGrid,
  heatmap,
  onFlipBoardChange,
  onBoardViewChange,
}) => {
  return (
    <div
      className="form-group"
      style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
    >
      <label className="form-check-label">
        <input
          className="form-check-input"
          type="checkbox"
          checked={flipBoard}
          onChange={() => onFlipBoardChange(!flipBoard)}
        />
        Flip Board
      </label>
      <label className="form-check-label">
        <input
          className="form-check-input"
          type="radio"
          name="boardView"
          checked={showGrid && !heatmap}
          onChange={() => onBoardViewChange("grid")}
        />
        Gri<u>d</u>
      </label>
      <label className="form-check-label">
        <input
          className="form-check-input"
          type="radio"
          name="boardView"
          checked={heatmap}
          onChange={() => onBoardViewChange("heatmap")}
        />
        Heatma<u>p</u>
      </label>
      <label className="form-check-label">
        <input
          className="form-check-input"
          type="radio"
          name="boardView"
          checked={!showGrid && !heatmap}
          onChange={() => onBoardViewChange("none")}
        />
        N<u>o</u>ne
      </label>
    </div>
  );
};

export default BoardViewControls;
