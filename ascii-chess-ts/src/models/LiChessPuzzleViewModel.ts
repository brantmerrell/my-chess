import { LiChessPuzzleResponse } from "./LiChessPuzzleResponse";
import { LiChessPuzzleModel } from "./LiChessPuzzleModel";
import { ChessGame } from '../chess/chessGame';

export class LiChessPuzzleViewModel {
    private liChessPuzzleResponse: LiChessPuzzleResponse;
    constructor(liChessPuzzleResponse: LiChessPuzzleResponse) {
        this.liChessPuzzleResponse = liChessPuzzleResponse;
    }
    get puzzle(): LiChessPuzzleModel {
        const startFen = 'your-standard-fen';

        // Construct game object from startFen
        const game = new ChessGame(startFen);

        // Split response pgn by space
        const pgnArr = this.liChessPuzzleResponse.game.pgn.split(' ');

        // For each pgn from index 0 to initialPly, pass to the game loadFEN method
        for (let i = 0; i < this.liChessPuzzleResponse.puzzle.initialPly; i++) {
            game.loadFen(pgnArr[i]);
        }

        // Call the game.toFen() method and store the output as initialPuzzleFEN
        const initialPuzzleFEN = game.toFen();

        return {
            puzzleId: '123',
            gameId: '123',
            puzzleRating: '',
            puzzlePlays: 123,
            solution: ['foo', 'bar'],
            themes: ['hello', 'world'],
            initialPuzzleFEN: initialPuzzleFEN,
        };
    }

}
