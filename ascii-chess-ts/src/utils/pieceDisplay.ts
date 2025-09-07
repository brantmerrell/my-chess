import { PieceDisplayMode, PIECE_SYMBOLS } from "../types/chess";

const PIECE_TO_FILLED_SYMBOL: { [key: string]: string } = {
  K: "♚",
  Q: "♛",
  R: "♜",
  B: "♝",
  N: "♞",
  P: "♟",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

export const getPieceDisplay = (
  piece: string,
  displayMode: PieceDisplayMode,
  color?: string,
): string => {
  switch (displayMode) {
    case "symbols":
      return (
        PIECE_TO_FILLED_SYMBOL[piece] ||
        PIECE_SYMBOLS[piece as keyof typeof PIECE_SYMBOLS] ||
        piece
      );
    case "masked":
      return "*";
    case "letters":
    default:
      return piece;
  }
};

export const isPieceWhite = (piece: string): boolean => {
  return piece === piece.toUpperCase() && /[KQRBNP]/.test(piece);
};

export const getPieceColor = (
  piece: string,
  colorOverride?: string,
): "white" | "black" => {
  if (colorOverride) {
    return colorOverride as "white" | "black";
  }
  return isPieceWhite(piece) ? "white" : "black";
};
