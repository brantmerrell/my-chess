import { PuzzleViewModel } from "./PuzzleViewModel";
import { LiChessPuzzleResponse } from "./LiChessPuzzleResponse";
import { LiChessPuzzleModel } from "./LiChessPuzzleModel";
import { ChessGame } from "../chess/chessGame";

export class LiChessPuzzleViewModel extends PuzzleViewModel<
  LiChessPuzzleResponse,
  LiChessPuzzleModel
> {
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

    const pgnMoves = this.response.game.pgn
      .split(/\s+/)
      .filter((move) => !move.includes("."));

    let movesApplied = 0;
    for (const move of pgnMoves) {
      if (movesApplied > this.response.puzzle.initialPly) {
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
      puzzleId: this.response.puzzle.id,
      gameId: this.response.game.id,
      puzzleRating: this.response.puzzle.rating,
      puzzlePlays: this.response.puzzle.plays,
      solution: this.response.puzzle.solution,
      themes: this.response.puzzle.themes,
      initialPuzzleFEN: game.toFen(),
      setupHistory,
      fetchStatus: {
        loading: false,
        error: null,
      },
    };
  }
}
