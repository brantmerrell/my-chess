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
        const pgnMoves = this.liChessPuzzleResponse.game.pgn
            .split(/\s+/)
            .slice(0);
        let movesApplied = 0;
        for (const move of pgnMoves) {
            game.makeMove(move);
            movesApplied++;

            if (movesApplied >= this.liChessPuzzleResponse.puzzle.initialPly) {
                break;
            }
        }

        const initialPuzzleFEN = game.toFen();

        return {
            puzzleId: this.liChessPuzzleResponse.puzzle.id,
            gameId: this.liChessPuzzleResponse.game.id,
            puzzleRating: this.liChessPuzzleResponse.puzzle.rating,
            puzzlePlays: this.liChessPuzzleResponse.puzzle.plays,
            solution: this.liChessPuzzleResponse.puzzle.solution,
            themes: this.liChessPuzzleResponse.puzzle.themes,
            initialPuzzleFEN,
            fetchStatus: {
                loading: false,
                error: null,
            },
        };
    }
}
