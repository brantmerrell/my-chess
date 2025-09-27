import React from "react";
import { PieceDisplayMode } from "../../types/chess";
import { useMoveHistory } from "../../hooks/useMoveHistory";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { ChessGame } from "../../chess/chessGame";
import "./MoveControls.css";

interface GameState {
  gameId: string | null;
  isPlaying: boolean;
  color: "white" | "black" | null;
  opponentName: string | null;
  status: string;
  timeLeft: { white: number; black: number } | null;
}

interface MoveControlsProps {
  displayMode: PieceDisplayMode;
  externalMoveInput?: string;
  externalMoveDropdown?: string;
  onExternalMoveInputChange?: (value: string) => void;
  onExternalMoveDropdownChange?: (value: string) => void;
  onMoveAttempt?: (
    fromSquare: string,
    toSquare: string,
    uciMove: string,
  ) => boolean;
  gameState?: GameState;
}

const MoveControls: React.FC<MoveControlsProps> = ({
  displayMode,
  externalMoveInput,
  externalMoveDropdown,
  onExternalMoveInputChange,
  onExternalMoveDropdownChange,
  onMoveAttempt,
  gameState,
}) => {
  const {
    moves,
    selectedMove: internalSelectedMove,
    errorMessage,
    undoMessage,
    setSelectedMove: setInternalSelectedMove,
    makeSelectedMove,
    undoLastMove,
  } = useMoveHistory(displayMode);

  const selectedMove =
    externalMoveDropdown !== undefined
      ? externalMoveDropdown
      : internalSelectedMove;
  const moveInput =
    externalMoveInput !== undefined ? externalMoveInput : selectedMove;

  const setSelectedMove = (value: string) => {
    if (onExternalMoveDropdownChange) {
      onExternalMoveDropdownChange(value);
      if (onExternalMoveInputChange) {
        onExternalMoveInputChange(value);
      }
    } else {
      setInternalSelectedMove(value);
    }
  };

  const setMoveInput = (value: string) => {
    if (onExternalMoveInputChange) {
      onExternalMoveInputChange(value);
      if (onExternalMoveDropdownChange && moves.includes(value)) {
        onExternalMoveDropdownChange(value);
      } else if (onExternalMoveDropdownChange && !moves.includes(value)) {
        onExternalMoveDropdownChange("");
      }
    } else {
      setInternalSelectedMove(value);
    }
  };

  const { currentPositionIndex, positions } = useSelector(
    (state: RootState) => state.chessGame,
  );
  const isAtLatestPosition = currentPositionIndex === positions.length - 1;
  const hasHistory = positions.length > 1;

  const handleMoveSubmit = () => {
    if (!isAtLatestPosition) return;
    handleMove(moveInput);
    if (onExternalMoveInputChange) onExternalMoveInputChange("");
    if (onExternalMoveDropdownChange) onExternalMoveDropdownChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isAtLatestPosition) {
      handleMove(moveInput);
      if (onExternalMoveInputChange) onExternalMoveInputChange("");
      if (onExternalMoveDropdownChange) onExternalMoveDropdownChange("");
    }
  };

  const handleMove = (move: string) => {
    if (!move.trim()) return;

    // If we have a Lichess game and the move handler, try to use it
    if (gameState?.isPlaying && onMoveAttempt) {
      console.log("Trying to handle move via Lichess integration:", move);

      try {
        // Get current FEN from Redux state
        const currentFen = positions[currentPositionIndex]?.fen;

        if (currentFen) {
          const game = new ChessGame(currentFen, displayMode);
          const verboseMoves = game.getVerboseMoves();

          // Try to find the move - could be SAN (e4) or UCI (e2e4)
          let matchingMove = verboseMoves.find((m: any) => m.san === move);

          if (!matchingMove) {
            // Try as UCI move
            matchingMove = verboseMoves.find((m: any) => {
              const uci = m.from + m.to + (m.promotion || "");
              return uci === move;
            });
          }

          if (matchingMove) {
            console.log("Found matching move for Lichess:", matchingMove);
            const success = onMoveAttempt(
              matchingMove.from,
              matchingMove.to,
              matchingMove.from +
                matchingMove.to +
                (matchingMove.promotion || ""),
            );
            if (success) {
              return; // Move handled by Lichess integration
            }
          }
        }
      } catch (error) {
        console.error("Error in Lichess move handling:", error);
      }
    }

    // Fallback to regular move handling for analysis mode
    console.log("Using regular move handling for:", move);
    makeSelectedMove(move);
  };

  const handleUndoMove = () => {
    if (!isAtLatestPosition) return;
    undoLastMove();
  };

  return (
    <div className="moves-layout">
      <div className="moves-forward">
        <div
          style={{
            position: "relative",
            width: "100%",
            gridArea: "dropdown",
            margin: 0,
            padding: 0,
            boxSizing: "border-box",
          }}
        >
          <select
            id="selectedMove"
            value={selectedMove}
            onChange={(e) => setSelectedMove(e.target.value)}
            disabled={!isAtLatestPosition}
            aria-label="Move Selection"
            title={
              !isAtLatestPosition
                ? "Navigate to latest position to make moves"
                : "Select a move (c)"
            }
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                // Try showPicker() if available, otherwise simulate click
                const selectElement = e.currentTarget as HTMLSelectElement;
                if (
                  "showPicker" in selectElement &&
                  typeof selectElement.showPicker === "function"
                ) {
                  try {
                    selectElement.showPicker();
                  } catch (error) {
                    // Fallback to click if showPicker fails
                    selectElement.click();
                  }
                } else {
                  selectElement.click();
                }
              }
            }}
          >
            <option value="">
              {isAtLatestPosition ? "Sele(c)t" : "Navigate to latest position"}
            </option>
            {isAtLatestPosition &&
              moves.map((move, index) => (
                <option key={index} value={move}>
                  {move}
                </option>
              ))}
          </select>
        </div>
        <input
          id="move"
          type="text"
          value={moveInput}
          onChange={(e) => setMoveInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isAtLatestPosition}
          aria-label="Move Input"
          title={
            !isAtLatestPosition
              ? "Navigate to latest position to make moves"
              : "Enter a move (M)"
          }
          placeholder={isAtLatestPosition ? "(M)ove" : ""}
        />
        <button
          id="submitMove"
          onClick={handleMoveSubmit}
          disabled={!isAtLatestPosition}
          className={`btn ${isAtLatestPosition ? "btn-info" : "btn-secondary"}`}
          title={
            !isAtLatestPosition
              ? "Navigate to latest position to make moves"
              : "Submit move"
          }
        >
          Submit Move
        </button>
      </div>
      <div className="moves-buttons">
        <button
          id="undo"
          onClick={handleUndoMove}
          disabled={!isAtLatestPosition || !hasHistory}
          className={`btn ${isAtLatestPosition && hasHistory ? "btn-danger" : "btn-secondary"}`}
          title={
            !isAtLatestPosition
              ? "Navigate to latest position to undo moves"
              : !hasHistory
                ? "No moves to undo"
                : "Undo last move (u)"
          }
        >
          Undo Move <span className="keybinding">u</span>
        </button>
      </div>

      {undoMessage && (
        <div className="undo-message text-danger" style={{ marginTop: "10px" }}>
          {undoMessage}
        </div>
      )}

      {errorMessage && (
        <div className="move-error" style={{ color: "red", marginTop: "10px" }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default MoveControls;
