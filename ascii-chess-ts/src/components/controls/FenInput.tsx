import React from "react";
import "./FenInput.css";
import { BootstrapTheme } from "./ThemeSelector";

interface FenInputProps {
  fen: string;
  onFenChange: (fen: string) => void;
  onSubmitFen: () => void;
  theme: BootstrapTheme;
}

const FenInput: React.FC<FenInputProps> = ({
  fen,
  onFenChange,
  onSubmitFen,
  theme,
}) => {
  return (
    <div className="fen-layout">
      <div className="fen-controls">
        <input
          id="edit-string"
          className="fen-input"
          type="text"
          value={fen}
          onChange={(e) => onFenChange(e.target.value)}
          aria-label="FEN Input"
        />
        <button
          id="submitFen"
          onClick={onSubmitFen}
          className="btn btn-primary"
        >
          Submit FEN
        </button>
      </div>
    </div>
  );
};

export default FenInput;
