import React, { useState, useEffect, useRef, useCallback } from "react";
import "./FenInput.css";
import { BootstrapTheme } from "./ThemeSelector";
import FenKeyboard from "./FenKeyboard";

interface FenInputProps {
  fen: string;
  onFenChange: (fen: string) => void;
  onSubmitFen: () => void;
  theme: BootstrapTheme;
  isCustomMode: boolean;
}

const FenInput: React.FC<FenInputProps> = ({
  fen,
  onFenChange,
  onSubmitFen,
  theme,
  isCustomMode,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInteractingWithKeyboard = useRef(false);
  const cursorPositionRef = useRef<number>(fen.length);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000); // 62.5rem
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update cursor position when input changes externally
  useEffect(() => {
    if (inputRef.current) {
      const pos = inputRef.current.selectionStart ?? fen.length;
      cursorPositionRef.current = pos;
    }
  }, [fen]);

  const setCursorPosition = useCallback((pos: number) => {
    cursorPositionRef.current = pos;
    if (inputRef.current) {
      inputRef.current.setSelectionRange(pos, pos);
    }
  }, []);

  const handleKeyboardInteractionStart = () => {
    isInteractingWithKeyboard.current = true;
    setTimeout(() => {
      isInteractingWithKeyboard.current = false;
    }, 100);
  };

  const handleKeyPress = useCallback((key: string) => {
    const pos = cursorPositionRef.current;
    const newFen = fen.slice(0, pos) + key + fen.slice(pos);
    onFenChange(newFen);
    // Move cursor after the inserted character
    setTimeout(() => setCursorPosition(pos + 1), 0);
  }, [fen, onFenChange, setCursorPosition]);

  const handleBackspace = useCallback(() => {
    const pos = cursorPositionRef.current;
    if (pos > 0) {
      const newFen = fen.slice(0, pos - 1) + fen.slice(pos);
      onFenChange(newFen);
      setTimeout(() => setCursorPosition(pos - 1), 0);
    }
  }, [fen, onFenChange, setCursorPosition]);

  const handleClear = useCallback(() => {
    onFenChange("");
    setTimeout(() => setCursorPosition(0), 0);
  }, [onFenChange, setCursorPosition]);

  const handleSubmit = useCallback(() => {
    onSubmitFen();
  }, [onSubmitFen]);

  const handleCursorLeft = useCallback(() => {
    const pos = cursorPositionRef.current;
    if (pos > 0) {
      setCursorPosition(pos - 1);
    }
  }, [setCursorPosition]);

  const handleCursorRight = useCallback(() => {
    const pos = cursorPositionRef.current;
    if (pos < fen.length) {
      setCursorPosition(pos + 1);
    }
  }, [fen.length, setCursorPosition]);

  const handleJumpLeft = useCallback(() => {
    const pos = cursorPositionRef.current;
    // Find previous / or space before current position
    let newPos = pos - 1;
    while (newPos > 0 && fen[newPos] !== "/" && fen[newPos] !== " ") {
      newPos--;
    }
    if (newPos <= 0) {
      setCursorPosition(0);
    } else {
      setCursorPosition(newPos);
    }
  }, [fen, setCursorPosition]);

  const handleJumpRight = useCallback(() => {
    const pos = cursorPositionRef.current;
    // Find next / or space after current position
    let newPos = pos;
    while (newPos < fen.length && fen[newPos] !== "/" && fen[newPos] !== " ") {
      newPos++;
    }
    // Move past the separator if found
    if (newPos < fen.length) {
      newPos++;
    }
    setCursorPosition(newPos);
  }, [fen, setCursorPosition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFenChange(e.target.value);
    // Update cursor position from input
    cursorPositionRef.current = e.target.selectionStart ?? e.target.value.length;
  };

  const handleInputSelect = () => {
    if (inputRef.current) {
      cursorPositionRef.current = inputRef.current.selectionStart ?? fen.length;
    }
  };

  return (
    <div className="fen-layout">
      <div className="fen-controls">
        <input
          ref={inputRef}
          id="edit-string"
          className={`fen-input--${theme}`}
          type="text"
          value={fen}
          onChange={handleInputChange}
          onSelect={handleInputSelect}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isCustomMode) {
              e.preventDefault();
              onSubmitFen();
            }
          }}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => {
            if (isInteractingWithKeyboard.current) {
              return;
            }
            setTimeout(() => setIsInputFocused(false), 50);
          }}
          aria-label="FEN Input"
          inputMode={isMobile ? "none" : "text"}
        />
        <button
          id="submitFen"
          onClick={onSubmitFen}
          className="btn btn-primary"
          disabled={!isCustomMode}
        >
          Submit FEN
        </button>
      </div>
      <FenKeyboard
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onClear={handleClear}
        onSubmit={handleSubmit}
        onCursorLeft={handleCursorLeft}
        onCursorRight={handleCursorRight}
        onJumpLeft={handleJumpLeft}
        onJumpRight={handleJumpRight}
        isVisible={isMobile && isInputFocused}
        onInteractionStart={handleKeyboardInteractionStart}
      />
    </div>
  );
};

export default FenInput;
