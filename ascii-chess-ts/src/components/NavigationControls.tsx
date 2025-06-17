import React from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hooks";
import { RootState, goForward, goBackward, goToPosition } from "../app/store";
import "./NavigationControls.css";

const NavigationControls: React.FC = () => {
    const dispatch = useAppDispatch();
    const { positions, currentPositionIndex } = useSelector(
        (state: RootState) => state.chessGame
    );

    const canGoBackward = currentPositionIndex > 0;
    const canGoForward = currentPositionIndex < positions.length - 1;

    const handleBackward = () => {
        if (canGoBackward) {
            dispatch(goBackward());
        }
    };

    const handleForward = () => {
        if (canGoForward) {
            dispatch(goForward());
        }
    };

    const handleGoToStart = () => {
        dispatch(goToPosition(0));
    };

    const handleGoToEnd = () => {
        dispatch(goToPosition(positions.length - 1));
    };

    return (
        <div className="navigation-controls">
            <div className="navigation-buttons">
                <button
                    onClick={handleGoToStart}
                    disabled={!canGoBackward}
                    className="nav-button start-button"
                    title="Go to start"
                >
                    ⏮
                </button>
                <button
                    onClick={handleBackward}
                    disabled={!canGoBackward}
                    className="nav-button backward-button"
                    title="Previous move"
                >
                    ◀
                </button>
                <span className="position-indicator">
                    {currentPositionIndex + 0} / {positions.length - 1}
                </span>
                <button
                    onClick={handleForward}
                    disabled={!canGoForward}
                    className="nav-button forward-button"
                    title="Next move"
                >
                    ▶
                </button>
                <button
                    onClick={handleGoToEnd}
                    disabled={!canGoForward}
                    className="nav-button end-button"
                    title="Go to end"
                >
                    ⏭
                </button>
            </div>
        </div>
    );
};

export default NavigationControls;

