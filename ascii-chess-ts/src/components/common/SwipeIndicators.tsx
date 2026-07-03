import React from "react";
import { MobileView } from "../../hooks/useMobileSwipeView";

interface SwipeIndicatorsProps {
  activeView: MobileView;
  onSelectView: (view: MobileView) => void;
}

const SwipeIndicators: React.FC<SwipeIndicatorsProps> = ({
  activeView,
  onSelectView,
}) => {
  return (
    <div className="swipe-indicators">
      <button
        className={`swipe-indicator ${activeView === "positional" ? "active" : ""}`}
        onClick={() => onSelectView("positional")}
        aria-label="View positional analysis"
      >
        <span className="swipe-indicator-label">Position</span>
      </button>
      <button
        className={`swipe-indicator ${activeView === "historical" ? "active" : ""}`}
        onClick={() => onSelectView("historical")}
        aria-label="View move history"
      >
        <span className="swipe-indicator-label">History</span>
      </button>
    </div>
  );
};

export default SwipeIndicators;
