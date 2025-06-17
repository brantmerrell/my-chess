import React from "react";
import { PieceDisplayMode } from "../types/chess";
import { useMoveHistory } from "../hooks/useMoveHistory";
import "./MoveControls.css";

interface MoveControlsProps {
    displayMode: PieceDisplayMode;
}

// TODO
// disable if active move is not most recent
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

    return (
        <div className="moves-layout">
            <div className="moves-forward">
                <select
                    id="selectedMove"
                    value={selectedMove}
                    onChange={(e) => setSelectedMove(e.target.value)}
                    aria-label="Move Selection"
                >
                    <option value="">Moves</option>
                    {moves.map((move, index) => (
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
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            makeSelectedMove(selectedMove);
                        }
                    }}
                    aria-label="Move Input"
                />
                <button
                    id="submitMove"
                    onClick={() => makeSelectedMove(selectedMove)}
                    className="btn btn-info"
                >
                    Submit Move
                </button>
            </div>
            <button id="undo" onClick={undoLastMove} className="btn btn-danger">
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
