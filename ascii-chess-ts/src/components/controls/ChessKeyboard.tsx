import React from "react";
import "./ChessKeyboard.css";

interface ChessKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  isVisible: boolean;
  disabled?: boolean;
  onInteractionStart?: () => void;
}

const ChessKeyboard: React.FC<ChessKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  onSubmit,
  isVisible,
  disabled = false,
  onInteractionStart,
}) => {
  if (!isVisible) return null;

  const rows = [
    ["a", "b", "c", "d", "e", "f", "g", "h"],
    ["1", "2", "3", "4", "5", "6", "7", "8"],
    ["R", "N", "B", "Q", "K", "O"],
    ["x", "=", "+", "#", "-"],
  ];

  const handleKeyClick = (key: string) => {
    if (disabled) return;
    onKeyPress(key);
  };

  // Prevent buttons from stealing focus and notify parent of interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onInteractionStart?.();
  };

  return (
    <div className="chess-keyboard">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="chess-keyboard-row">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              className="chess-key"
              onPointerDown={handlePointerDown}
              onClick={() => handleKeyClick(key)}
              disabled={disabled}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
      <div className="chess-keyboard-row chess-keyboard-actions">
        <button
          type="button"
          className="chess-key chess-key-action"
          onPointerDown={handlePointerDown}
          onClick={onBackspace}
          disabled={disabled}
          aria-label="Backspace"
        >
          ⌫
        </button>
        <button
          type="button"
          className="chess-key chess-key-action chess-key-clear"
          onPointerDown={handlePointerDown}
          onClick={onClear}
          disabled={disabled}
        >
          Clear
        </button>
        <button
          type="button"
          className="chess-key chess-key-action chess-key-submit"
          onPointerDown={handlePointerDown}
          onClick={onSubmit}
          disabled={disabled}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ChessKeyboard;
