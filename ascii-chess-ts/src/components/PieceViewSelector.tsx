import React from "react";
import { PieceDisplayMode } from "../types/chess";
import "./SelectStyle.css";

interface PieceViewSelectorProps {
    displayMode: PieceDisplayMode;
    onDisplayModeChange: (mode: PieceDisplayMode) => void;
}

const PieceViewSelector: React.FC<PieceViewSelectorProps> = ({
    displayMode,
    onDisplayModeChange,
}) => {
    return (
        <div className="selector-wrapper">
            <label className="selector-label text-info">Piece View</label>
            <div className="selector-container">
                <select
                    className="select-control btn btn-info"
                    value={displayMode}
                    onChange={(e) => onDisplayModeChange(e.target.value as PieceDisplayMode)}
                    aria-label="Piece View Selection"
                >
                    <option value="symbols">Unicode</option>
                    <option value="letters">Letters</option>
                    <option value="masked">Asterisk</option>
                </select>
            </div>
        </div>
    );
};

export default PieceViewSelector;


