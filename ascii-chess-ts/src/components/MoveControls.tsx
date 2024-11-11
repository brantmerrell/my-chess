import React from "react";

interface MoveControlsProps {
    selectedMove: string;
    availableMoves: string[];
    onMoveChange: (move: string) => void;
    onMoveSubmit: () => void;
    onUndoMove: () => void;
    undoMessage: string;
    moveError: string;
}

const MoveControls: React.FC<MoveControlsProps> = ({
    selectedMove,
    availableMoves,
    onMoveChange,
    onMoveSubmit,
    onUndoMove,
    undoMessage,
    moveError,
}) => {
    return (
        <div className="moves-layout">
            <div className="moves-forward">
                <select
                    id="selectedMove"
                    value={selectedMove}
                    onChange={(e) => onMoveChange(e.target.value)}
                >
                    <option value="">Moves</option>
                    {availableMoves.map((move, index) => (
                        <option key={index} value={move}>
                            {move}
                        </option>
                    ))}
                </select>
                <input
                    id="move"
                    type="text"
                    value={selectedMove}
                    onChange={(e) => onMoveChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onMoveSubmit();
                        }
                    }}
                    aria-label="Move Input"
                />
                <button id="submitMove" onClick={onMoveSubmit}>
                    Submit Move
                </button>
            </div>
            <button id="undo" onClick={onUndoMove}>
                Undo Move
            </button>
            {undoMessage && (
                <div
                    className="undo-message"
                    style={{ color: "red", marginTop: "10px" }}
                >
                    {undoMessage}
                </div>
            )}
            {moveError && (
                <div
                    className="move-error"
                    style={{ color: "red", marginTop: "10px" }}
                >
                    {moveError}
                </div>
            )}
        </div>
    );
};

export default MoveControls;
