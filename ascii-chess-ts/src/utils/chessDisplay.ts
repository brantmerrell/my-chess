import { PieceDisplayMode, PIECE_SYMBOLS } from "../types/chess";
import { cleanChessPieceUnicode } from "../utils";

// Centralized white piece mapping for letter-based components (GraphView, ArcView, etc.)
export const createWhitePieceMapByLetter = (): { [key: string]: string } => ({
  K: cleanChessPieceUnicode("♚"),
  Q: cleanChessPieceUnicode("♛"),
  R: cleanChessPieceUnicode("♜"),
  B: cleanChessPieceUnicode("♝"),
  N: cleanChessPieceUnicode("♞"),
  P: cleanChessPieceUnicode("♟"),
});

// Centralized white piece mapping for symbol-based components (BoardDisplay)
export const createWhitePieceMapBySymbol = (): { [key: string]: string } => ({
  [cleanChessPieceUnicode("♔")]: cleanChessPieceUnicode("♚"),
  [cleanChessPieceUnicode("♕")]: cleanChessPieceUnicode("♛"),
  [cleanChessPieceUnicode("♖")]: cleanChessPieceUnicode("♜"),
  [cleanChessPieceUnicode("♗")]: cleanChessPieceUnicode("♝"),
  [cleanChessPieceUnicode("♘")]: cleanChessPieceUnicode("♞"),
  [cleanChessPieceUnicode("♙")]: cleanChessPieceUnicode("♟"),
});

// Centralized piece display logic - eliminates duplication across components
export const getPieceDisplay = (
  piece: string,
  color?: string,
  displayMode: PieceDisplayMode = "symbols",
): string => {
  switch (displayMode) {
    case "symbols":
    case "full":
      if (color === "white" || (!color && isWhitePiece(piece))) {
        const whitePieceMap = createWhitePieceMapByLetter();
        return whitePieceMap[piece] || piece;
      }
      return PIECE_SYMBOLS[piece as keyof typeof PIECE_SYMBOLS] || piece;
    case "masked":
      return "*";
    default:
      return piece;
  }
};

// Helper function to determine if a piece is white based on letter case
const isWhitePiece = (piece: string): boolean => {
  return piece === piece.toUpperCase() && /[KQRBNP]/.test(piece);
};
