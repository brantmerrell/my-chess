import { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../app/hooks";
import { RootState, makeMove } from "../app/store";
import { ChessGame } from "../chess/chessGame";
import { PieceDisplayMode } from "../types/chess";
import { NotificationCallback } from "../types/lichessGame";
import { useLichessGame } from "../contexts/LichessGameContext";

export interface PromotionDialogState {
  isOpen: boolean;
  moves: any[];
  fromSquare: string;
  toSquare: string;
}

const closedPromotionDialog: PromotionDialogState = {
  isOpen: false,
  moves: [],
  fromSquare: "",
  toSquare: "",
};

/**
 * Owns the move input fields, promotion dialog, and the logic for applying a
 * move either to the local board (analysis) or to an active Lichess game.
 */
export function useMoveSubmission(
  displayMode: PieceDisplayMode,
  showNotification: NotificationCallback,
  clearNotification: () => void,
) {
  const dispatch = useAppDispatch();
  const { gameState, sendMove, getCurrentPosition } = useLichessGame();
  const chessGameState = useSelector((state: RootState) => state.chessGame);

  const [moveInput, setMoveInput] = useState<string>("");
  const [moveDropdownValue, setMoveDropdownValue] = useState<string>("");
  const [promotionDialog, setPromotionDialog] = useState<PromotionDialogState>(
    closedPromotionDialog,
  );

  const clearMoveInputs = () => {
    setMoveInput("");
    setMoveDropdownValue("");
  };

  const sendMoveToLichess = (
    fromSquare: string,
    toSquare: string,
    promotion: string,
  ) => {
    const uciMove = fromSquare + toSquare + promotion;
    sendMove(fromSquare, toSquare, promotion)
      .then((success) => {
        if (success) {
          showNotification(`${uciMove} sent to Lichess`, "success");
        } else {
          showNotification(`Failed to send ${uciMove} to Lichess`, "error");
        }
      })
      .catch((error) => {
        console.error("Error sending move:", error);
        showNotification(`Error sending ${uciMove} to Lichess`, "error");
      });
  };

  const handlePromotionSelect = (selectedMove: any) => {
    if (gameState.isPlaying && gameState.gameId) {
      sendMoveToLichess(
        promotionDialog.fromSquare,
        promotionDialog.toSquare,
        selectedMove.promotion || "",
      );
    } else {
      // For analysis mode, update the local board immediately
      dispatch(makeMove(selectedMove.san));
    }
    clearMoveInputs();
    setPromotionDialog(closedPromotionDialog);
  };

  const handlePromotionCancel = () => {
    setPromotionDialog(closedPromotionDialog);
  };

  const handleMoveAttempt = (
    fromSquare: string,
    toSquare: string,
    uciMove: string,
  ): boolean => {
    try {
      const inLichessGame = gameState.isPlaying && !!gameState.gameId;
      // Use the Lichess cache position if in a Lichess game, otherwise Redux state
      const game = inLichessGame
        ? getCurrentPosition()
        : new ChessGame(chessGameState.fen, displayMode);
      const verboseMoves = game.getVerboseMoves();

      const matchingMoves = verboseMoves.filter(
        (move: any) => move.from === fromSquare && move.to === toSquare,
      );

      if (matchingMoves.length === 0) {
        if (gameState.isPlaying && !gameState.isMyTurn) {
          showNotification("It's not your turn", "warning");
        } else {
          const currentTurn = game.toFen().split(" ")[1];
          const turnColor = currentTurn === "w" ? "white" : "black";
          const movesFromSquare = verboseMoves.filter(
            (m: any) => m.from === fromSquare,
          );
          if (movesFromSquare.length === 0) {
            // No moves from this square - likely wrong color or empty square
            showNotification(`It's ${turnColor}'s turn to move`, "warning");
          } else {
            showNotification("Invalid move", "error");
          }
        }
        return false;
      }

      if (matchingMoves.length > 1 && matchingMoves.some((m) => m.promotion)) {
        setPromotionDialog({
          isOpen: true,
          moves: matchingMoves,
          fromSquare,
          toSquare,
        });
        return true; // Move pending promotion selection
      }

      const matchingMove = matchingMoves[0];
      if (inLichessGame) {
        // Don't update the local board immediately for Lichess games -
        // wait for confirmation from the game stream
        sendMoveToLichess(fromSquare, toSquare, matchingMove.promotion || "");
      } else {
        // For analysis mode, update the local board immediately
        dispatch(makeMove(matchingMove.san));
      }
      clearMoveInputs();
      clearNotification();
      return true;
    } catch (error) {
      setMoveInput(uciMove);
      setMoveDropdownValue("");
      return false;
    }
  };

  return {
    moveInput,
    setMoveInput,
    moveDropdownValue,
    setMoveDropdownValue,
    promotionDialog,
    handleMoveAttempt,
    handlePromotionSelect,
    handlePromotionCancel,
  };
}
