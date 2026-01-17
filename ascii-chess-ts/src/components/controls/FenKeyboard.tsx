import React from "react";
import "./FenKeyboard.css";

interface FenKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onCursorLeft: () => void;
  onCursorRight: () => void;
  onJumpLeft: () => void;
  onJumpRight: () => void;
  isVisible: boolean;
  onInteractionStart?: () => void;
}

const FenKeyboard: React.FC<FenKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  onSubmit,
  onCursorLeft,
  onCursorRight,
  onJumpLeft,
  onJumpRight,
  isVisible,
  onInteractionStart,
}) => {
  if (!isVisible) return null;

  const rows = [
    ["r", "n", "b", "q", "k", "p", "w"],
    ["R", "N", "B", "Q", "K", "P"],
    ["0", "1", "2", "3", "4", "5", "6", "7", "8"],
    ["/", "-", " "],
  ];

  const handleKeyClick = (key: string) => {
    onKeyPress(key);
  };

  // Prevent buttons from stealing focus and notify parent of interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onInteractionStart?.();
  };

  return (
    <div className="fen-keyboard" onPointerDown={handlePointerDown}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="fen-keyboard-row">
          {row.map((key, keyIndex) => (
            <button
              key={`${rowIndex}-${keyIndex}`}
              type="button"
              className={`fen-key ${key === " " ? "fen-key-space" : ""}`}
              onPointerDown={handlePointerDown}
              onClick={() => handleKeyClick(key)}
            >
              {key === " " ? "␣" : key}
            </button>
          ))}
        </div>
      ))}
      <div className="fen-keyboard-row fen-keyboard-nav">
        <button
          type="button"
          className="fen-key fen-key-nav"
          onPointerDown={handlePointerDown}
          onClick={onJumpLeft}
          aria-label="Jump to previous separator"
          title="Jump to previous / or space"
        >
          ⇤
        </button>
        <button
          type="button"
          className="fen-key fen-key-nav"
          onPointerDown={handlePointerDown}
          onClick={onCursorLeft}
          aria-label="Move cursor left"
        >
          ←
        </button>
        <button
          type="button"
          className="fen-key fen-key-nav"
          onPointerDown={handlePointerDown}
          onClick={onCursorRight}
          aria-label="Move cursor right"
        >
          →
        </button>
        <button
          type="button"
          className="fen-key fen-key-nav"
          onPointerDown={handlePointerDown}
          onClick={onJumpRight}
          aria-label="Jump to next separator"
          title="Jump to next / or space"
        >
          ⇥
        </button>
      </div>
      <div className="fen-keyboard-row fen-keyboard-actions">
        <button
          type="button"
          className="fen-key fen-key-action"
          onPointerDown={handlePointerDown}
          onClick={onBackspace}
          aria-label="Backspace"
        >
          ⌫
        </button>
        <button
          type="button"
          className="fen-key fen-key-action fen-key-clear"
          onPointerDown={handlePointerDown}
          onClick={onClear}
        >
          Clear
        </button>
        <button
          type="button"
          className="fen-key fen-key-action fen-key-submit"
          onPointerDown={handlePointerDown}
          onClick={onSubmit}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default FenKeyboard;
