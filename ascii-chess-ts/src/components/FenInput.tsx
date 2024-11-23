import React from "react";
import "./FenInput.css";

interface FenInputProps {
    fen: string;
    onFenChange: (fen: string) => void;
    onSubmitFen: () => void;
}

const FenInput: React.FC<FenInputProps> = ({
    fen,
    onFenChange,
    onSubmitFen,
}) => {
    return (
        <div className="fen-layout">
            <div className="fen-controls">
                <input
                    id="edit-string"
                    className="fen-edit"
                    type="text"
                    value={fen}
                    onChange={(e) => onFenChange(e.target.value)}
                    aria-label="FEN Input"
                />
                <button
                    id="submitFen"
                    onClick={onSubmitFen}
                    className="btn btn-secondary"
                >
                    Submit FEN
                </button>
            </div>
        </div>
    );
};

export default FenInput;
