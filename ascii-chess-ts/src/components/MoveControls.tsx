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
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <select
                        id="selectedMove"
                        value={selectedMove}
                        onChange={(e) => setSelectedMove(e.target.value)}
                        disabled={!isAtLatestPosition}
                        aria-label="Move Selection"
                        title={
                            !isAtLatestPosition
                                ? "Navigate to latest position to make moves"
                                : "Select a move (M)"
                        }
                        onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                // Try showPicker() if available, otherwise simulate click
                                const selectElement = e.currentTarget as HTMLSelectElement;
                                if ('showPicker' in selectElement && typeof selectElement.showPicker === 'function') {
                                    try {
                                        selectElement.showPicker();
                                    } catch (error) {
                                        // Fallback to click if showPicker fails
                                        selectElement.click();
                                    }
                                } else {
                                    selectElement.click();
                                }
                            }
                        }}
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
                    <span className="keybinding" style={{ position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.8em', opacity: 0.6 }}>M</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
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
                                : "Enter a move (m)"
                        }
                        placeholder={isAtLatestPosition ? "Move (m)" : ""}
                    />
                </div>
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
                          : "Undo last move (u)"
                }
            >
                Undo Move <span className="keybinding">u</span>
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
