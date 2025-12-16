import React from "react";
import { PieceDisplayMode } from "../../types/chess";
import { useMoveHistory } from "../../hooks/useMoveHistory";
import "./NavigationControls.css";

interface NavigationControlsProps {
  displayMode: PieceDisplayMode;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  displayMode,
}) => {
  const {
    positions,
    currentPositionIndex,
    navigateForward,
    navigateBackward,
    navigateToPosition,
  } = useMoveHistory(displayMode);

  const canGoBackward = currentPositionIndex > 0;
  const canGoForward = currentPositionIndex < positions.length - 1;

  const handleBackward = () => {
    if (canGoBackward) {
      navigateBackward();
    }
  };

  const handleForward = () => {
    if (canGoForward) {
      navigateForward();
    }
  };

  const handleGoToStart = () => {
    navigateToPosition(0);
  };

  const handleGoToEnd = () => {
    navigateToPosition(positions.length - 1);
  };

  return (
    <div className="navigation-controls">
      <div className="navigation-buttons">
        <button
          onClick={handleGoToStart}
          disabled={!canGoBackward}
          className="nav-button start-button"
          title="Go to start (^)"
        >
          ⏮ <span className="keybinding">^</span>
        </button>
        <button
          onClick={handleBackward}
          disabled={!canGoBackward}
          className="nav-button backward-button"
          title="Previous move (h)"
        >
          ◀ <span className="keybinding">h</span>
        </button>
        <span className="position-indicator">
          {currentPositionIndex + 0} / {positions.length - 1}
        </span>
        <button
          onClick={handleForward}
          disabled={!canGoForward}
          className="nav-button forward-button"
          title="Next move (l)"
        >
          ▶ <span className="keybinding">l</span>
        </button>
        <button
          onClick={handleGoToEnd}
          disabled={!canGoForward}
          className="nav-button end-button"
          title="Go to end ($)"
        >
          ⏭ <span className="keybinding">$</span>
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;
