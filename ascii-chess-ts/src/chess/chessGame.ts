import { Chess } from 'chess.js';

export class ChessGame {
    private game: Chess;

    constructor(fen?: string) {
        if (fen === undefined) {
            this.game = new Chess();
        } else {
            this.game = new Chess(fen);
        }
    }

    public makeMove(move: string) {
        const result = this.game.move(move);
        if (result === null) {
            throw new Error("Invalid move provided to ChessGame.makeMove");
        }
        return result;
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

    public ascii() {
        return this.game.ascii();
    }
}

