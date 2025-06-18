import React from "react";
import { PieceDisplayMode } from "../types/chess";
import { useMoveHistory } from "../hooks/useMoveHistory";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import "./MoveControls.css";

interface MoveControlsProps {
    displayMode: PieceDisplayMode;
}

const MoveControls: React.FC<MoveControlsProps> = ({ displayMode }) => {
    const {
        moves,
        selectedMove,
        errorMessage,
        undoMessage,
        setSelectedMove,
        makeSelectedMove,
        undoLastMove,
    } = useMoveHistory(displayMode);

    const { currentPositionIndex, positions } = useSelector(
        (state: RootState) => state.chessGame
    );
    const isAtLatestPosition = currentPositionIndex === positions.length - 1;
    const hasHistory = positions.length > 1;

    const handleMoveSubmit = () => {
        if (!isAtLatestPosition) return;
        makeSelectedMove(selectedMove);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && isAtLatestPosition) {
            makeSelectedMove(selectedMove);
        }
    };

    const handleUndoMove = () => {
        if (!isAtLatestPosition) return;
        undoLastMove();
    };

    return (
        <div className="moves-layout">
            <div className="moves-forward">
                <select
                    id="selectedMove"
                    value={selectedMove}
                    onChange={(e) => setSelectedMove(e.target.value)}
                    disabled={!isAtLatestPosition}
                    aria-label="Move Selection"
                    title={
                        !isAtLatestPosition
                            ? "Navigate to latest position to make moves"
                            : "Select a move"
                    }
                >
                    <option value="">
                        {isAtLatestPosition
                            ? "Moves"
                            : "Navigate to latest position"}
                    </option>
                    {isAtLatestPosition &&
                        moves.map((move, index) => (
                            <option key={index} value={move}>
                                {move}
                            </option>
                        ))}
                </select>
                <input
                    id="move"
                    type="text"
                    value={selectedMove}
                    onChange={(e) => setSelectedMove(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isAtLatestPosition}
                    aria-label="Move Input"
                    title={
                        !isAtLatestPosition
                            ? "Navigate to latest position to make moves"
                            : "Enter a move"
                    }
                />
                <button
                    id="submitMove"
                    onClick={handleMoveSubmit}
                    disabled={!isAtLatestPosition}
                    className={`btn ${isAtLatestPosition ? "btn-info" : "btn-secondary"}`}
                    title={
                        !isAtLatestPosition
                            ? "Navigate to latest position to make moves"
                            : "Submit move"
                    }
                >
                    Submit Move
                </button>
            </div>
            <button
                id="undo"
                onClick={handleUndoMove}
                disabled={!isAtLatestPosition || !hasHistory}
                className={`btn ${isAtLatestPosition && hasHistory ? "btn-danger" : "btn-secondary"}`}
                title={
                    !isAtLatestPosition
                        ? "Navigate to latest position to undo moves"
                        : !hasHistory
                          ? "No moves to undo"
                          : "Undo last move"
                }
            >
                Undo Move
            </button>

            {undoMessage && (
                <div
                    className="undo-message text-danger"
                    style={{ marginTop: "10px" }}
                >
                    {undoMessage}
                </div>
            )}

            {errorMessage && (
                <div
                    className="move-error"
                    style={{ color: "red", marginTop: "10px" }}
                >
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default MoveControls;
