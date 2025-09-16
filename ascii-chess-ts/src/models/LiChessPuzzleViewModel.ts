import { LiChessPuzzleResponse } from "./LiChessPuzzleResponse";
import { LiChessPuzzleModel } from "./LiChessPuzzleModel";
import { ChessGame } from "../chess/chessGame";

export class LiChessPuzzleViewModel {
  private liChessPuzzleResponse: LiChessPuzzleResponse;
  constructor(liChessPuzzleResponse: LiChessPuzzleResponse) {
    this.liChessPuzzleResponse = liChessPuzzleResponse;
  }

  get puzzle(): LiChessPuzzleModel {
    const game = new ChessGame();
    const setupHistory = [
      {
        ply: 0,
        san: "-",
        uci: "-",
        fen: game.toFen(),
      },
    ];

    const pgnMoves = this.liChessPuzzleResponse.game.pgn
      .split(/\s+/)
      .filter((move) => !move.includes("."));

    let movesApplied = 0;
    for (const move of pgnMoves) {
      if (movesApplied > this.liChessPuzzleResponse.puzzle.initialPly) {
        break;
      }
      const lastFen = game.toFen();
      const [, activeColor, , , , fullmoveStr] = lastFen.split(" ");
      const moveNumber = parseInt(fullmoveStr);

      game.makeMove(move);
      movesApplied++;

      setupHistory.push({
        ply: movesApplied,
        san:
          activeColor === "w"
            ? `${moveNumber}.${move}`
            : `${moveNumber}...${move}`,
        uci: game.getLastUCI(),
        fen: game.toFen(),
      });
    }

    return {
      puzzleId: this.liChessPuzzleResponse.puzzle.id,
      gameId: this.liChessPuzzleResponse.game.id,
      puzzleRating: this.liChessPuzzleResponse.puzzle.rating,
      puzzlePlays: this.liChessPuzzleResponse.puzzle.plays,
      solution: this.liChessPuzzleResponse.puzzle.solution,
      themes: this.liChessPuzzleResponse.puzzle.themes,
      initialPuzzleFEN: game.toFen(),
      setupHistory,
      fetchStatus: {
        loading: false,
        error: null,
      },
    };
  }
}
