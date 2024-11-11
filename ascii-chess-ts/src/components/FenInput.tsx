import React from "react";

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
        <pre className="fen-layout">
            <pre id="horiz">
                <input
                    id="edit-string"
                    type="text"
                    value={fen}
                    onChange={(e) => onFenChange(e.target.value)}
                    aria-label="FEN Input"
                />
                <button id="submitFen" onClick={onSubmitFen}>
                    Submit FEN
                </button>
            </pre>
        </pre>
    );
};

export default FenInput;
