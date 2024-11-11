import React from "react";
import { PieceDisplayMode } from "../types/chess";

interface DisplayModeToggleProps {
    displayMode: PieceDisplayMode;
    onDisplayModeChange: (mode: PieceDisplayMode) => void;
}

const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({
    displayMode,
    onDisplayModeChange,
}) => {
    return (
        <div className="display-options">
            <button
                className={`display-toggle ${displayMode === "letters" ? "active" : ""}`}
                onClick={() => onDisplayModeChange("letters")}
                disabled={displayMode === "letters"}
            >
                Show Letters
            </button>
            <button
                className={`display-toggle ${displayMode === "symbols" ? "active" : ""}`}
                onClick={() => onDisplayModeChange("symbols")}
                disabled={displayMode === "symbols"}
            >
                Show Symbols
            </button>
            <button
                className={`display-toggle ${displayMode === "masked" ? "active" : ""}`}
                onClick={() => onDisplayModeChange("masked")}
                disabled={displayMode === "masked"}
            >
                Mask Board
            </button>
        </div>
    );
};

export default DisplayModeToggle;
