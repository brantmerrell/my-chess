import { cleanChessPieceUnicode } from "../utils";

export interface Position {
  ply: number;
  san: string;
  uci: string;
  fen: string;
}

export type PieceDisplayMode = "letters" | "symbols" | "masked";

export const PIECE_SYMBOLS = {
  K: cleanChessPieceUnicode("♔"),
  Q: cleanChessPieceUnicode("♕"),
  R: cleanChessPieceUnicode("♖"),
  B: cleanChessPieceUnicode("♗"),
  N: cleanChessPieceUnicode("♘"),
  P: cleanChessPieceUnicode("♙"),
  k: cleanChessPieceUnicode("♚"),
  q: cleanChessPieceUnicode("♛"),
  r: cleanChessPieceUnicode("♜"),
  b: cleanChessPieceUnicode("♝"),
  n: cleanChessPieceUnicode("♞"),
  p: cleanChessPieceUnicode("♟"),
};
