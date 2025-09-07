import { Chess } from "chess.js";
import { PieceDisplayMode, PIECE_SYMBOLS } from "../types/chess";

export class ChessGame {
  private game: Chess;
  private displayMode: PieceDisplayMode;

  constructor(fen?: string, displayMode: PieceDisplayMode = "letters") {
    if (fen === undefined) {
      this.game = new Chess();
    } else {
      this.game = new Chess(fen);
    }
    this.displayMode = displayMode;
  }

  public getMobilityForBothSides(): { white: number; black: number } {
    const originalFen = this.toFen();
    const [position, activeColor, castling, enPassant, halfMove, fullMove] =
      originalFen.split(" ");

    const currentMoves = this.getMoves().length;

    const switchedColor = activeColor === "w" ? "b" : "w";
    const switchedFen = `${position} ${switchedColor} ${castling} ${enPassant} ${halfMove} ${fullMove}`;

    try {
      const tempGame = new ChessGame(switchedFen, this.displayMode);
      const opponentMoves = tempGame.getMoves().length;

      if (activeColor === "w") {
        return { white: currentMoves, black: opponentMoves };
      } else {
        return { white: opponentMoves, black: currentMoves };
      }
    } catch (error) {
      console.warn(
        "Could not calculate opponent mobility for FEN:",
        switchedFen,
      );
      if (activeColor === "w") {
        return { white: currentMoves, black: 0 };
      } else {
        return { white: 0, black: currentMoves };
      }
    }
  }
  public static calculateMobilityFromFen(fen: string): {
    totalMoves: number;
    white: number;
    black: number;
  } {
    try {
      const game = new ChessGame(fen);
      const mobility = game.getMobilityForBothSides();
      return {
        totalMoves: mobility.white + mobility.black,
        white: mobility.white,
        black: mobility.black,
      };
    } catch (error) {
      console.error("Error calculating mobility for FEN:", fen, error);
      return { totalMoves: 0, white: 0, black: 0 };
    }
  }
  public setDisplayMode(mode: PieceDisplayMode) {
    this.displayMode = mode;
  }
  public makeMove(move: string) {
    const result = this.game.move(move);
    if (result === null) {
      throw new Error("Invalid move provided to ChessGame.makeMove");
    }
    return result;
  }
  public static countPiecesFromFen(fen: string): {
    white: number;
    black: number;
  } {
    const position = fen.split(" ")[0];
    let whitePieces = 0;
    let blackPieces = 0;

    for (const char of position) {
      if (/[KQRBNP]/.test(char)) {
        whitePieces++;
      } else if (/[kqrbnp]/.test(char)) {
        blackPieces++;
      }
    }

    return { white: whitePieces, black: blackPieces };
  }

  public loadFen(fen: string) {
    return this.game.load(fen);
  }

  public toFen() {
    return this.game.fen();
  }

  public undo() {
    return this.game.undo();
  }

  public getMoves() {
    return this.game.moves();
  }

  private convertPieces(ascii: string): string {
    if (this.displayMode === "letters") return ascii;
    const lines = ascii.split("\n");
    return lines
      .map((line, index) => {
        if (index >= 1 && index <= 8) {
          return line
            .split("")
            .map((char) => {
              if (char in PIECE_SYMBOLS) {
                return this.displayMode === "masked"
                  ? "*"
                  : PIECE_SYMBOLS[char as keyof typeof PIECE_SYMBOLS];
              }
              return char;
            })
            .join("");
        }
        return line;
      })
      .join("\n");
  }
  public history() {
    return this.game.history();
  }

  public getLastUCI(): string {
    const moves = this.game.history({ verbose: true });
    if (moves.length === 0) return "-";
    const lastMove = moves[moves.length - 1];
    return lastMove.from + lastMove.to + (lastMove.promotion || "");
  }

  public ascii(): string {
    const ascii = this.game.ascii();
    return this.convertPieces(ascii);
  }

  public asciiView(): string {
    const asciiLines = this.ascii().split("\n");
    const boardLines = asciiSub("\\.", " ", [...asciiLines]).join("\n");
    return boardLines;
  }
}

function asciiSub(
  patternAscii: string,
  replacementAscii: string,
  asciiLines: string[],
) {
  const regex = new RegExp(patternAscii, "g");
  return asciiLines.map((line, index) => {
    if (index >= 1 && index <= 9) {
      return line.replace(regex, replacementAscii);
    } else {
      return line;
    }
  });
}

function wrapString(str: string, maxLen: number) {
  const regex = new RegExp(`(.{1,${maxLen}})(\\s+|.{1,${maxLen}}$)`, "g");
  const matches = str.match(regex);
  if (matches) {
    return matches.join("\n");
  } else {
    return "";
  }
}
