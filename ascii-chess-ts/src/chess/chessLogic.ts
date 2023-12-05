import { Chess } from 'chess.js';

export class ChessGame {
    private game: Chess;

    constructor(fen?: string) {
        this.game = new Chess(fen);
    }

    public makeMove(move: string) {
        const result = this.game.move(move);
        if (result === null) {
            throw new Error("Invalid move provided to ChessGame.makeMove");
        }
        return result;
    }

    public loadFen(fen: string) {
        this.game = new Chess(fen);
    }

    public undo() {
        return this.game.undo();
    }

    public getMoves() {
        return this.game.moves();
    }

    public ascii() {
        return this.game.ascii();
    }
}

