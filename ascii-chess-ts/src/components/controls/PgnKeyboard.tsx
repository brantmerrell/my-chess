import React from "react";
import "./PgnKeyboard.css";

interface PgnKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  isVisible: boolean;
  disabled?: boolean;
  onInteractionStart?: () => void;
}

const PgnKeyboard: React.FC<PgnKeyboardProps> = ({
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
    ["R", "N", "B", "Q", "K", "O", "x"],
    ["a", "b", "c", "d", "e", "f", "g", "h"],
    ["1", "2", "3", "4", "5", "6", "7", "8"],
    ["=", "+", "#", "-"],
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
    <div className="pgn-keyboard" onPointerDown={handlePointerDown}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="pgn-keyboard-row">
          {row.map((key) => (
            <button
              key={key}
              type="button"
              className="pgn-key"
              onPointerDown={handlePointerDown}
              onClick={() => handleKeyClick(key)}
              disabled={disabled}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
      <div className="pgn-keyboard-row pgn-keyboard-actions">
        <button
          type="button"
          className="pgn-key pgn-key-action"
          onPointerDown={handlePointerDown}
          onClick={onBackspace}
          disabled={disabled}
          aria-label="Backspace"
        >
          ⌫
        </button>
        <button
          type="button"
          className="pgn-key pgn-key-action pgn-key-clear"
          onPointerDown={handlePointerDown}
          onClick={onClear}
          disabled={disabled}
        >
          Clear
        </button>
        <button
          type="button"
          className="pgn-key pgn-key-action pgn-key-submit"
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

export default PgnKeyboard;
