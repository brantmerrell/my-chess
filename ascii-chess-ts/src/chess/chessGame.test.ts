import { ChessGame } from "../chess/chessGame";

describe("ChessGame Class", () => {
    let chessGame: ChessGame;

    beforeEach(() => {
        chessGame = new ChessGame("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
    });

    test("makeMove updates the game state correctly", () => {
        chessGame.makeMove("e5");
        expect(chessGame.toFen()).toBe("rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
    });

    test("loadFen loads the FEN string correctly", () => {
        const startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        chessGame.loadFen(startingFen);
        expect(chessGame.toFen()).toBe(startingFen);
    });

    test("undoMove undoes the last move correctly", () => {
        const originalFen = chessGame.toFen();
        chessGame.makeMove("e5");
        chessGame.undo();
        expect(chessGame.toFen()).toBe(originalFen);
    });

    test("getLastUCI returns the correct UCI for the last move", () => {
        chessGame.makeMove("e5");
        expect(chessGame.getLastUCI()).toBe("e7e5");
    });

    test("asciiView returns the correct ASCII representation of the board", () => {
        const asciiView = chessGame.asciiView();
        expect(asciiView).toContain("Board:");
        expect(asciiView).toContain("8");
        expect(asciiView).toContain("1");
    });
});
