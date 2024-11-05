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
                                    : PIECE_SYMBOLS[
                                          char as keyof typeof PIECE_SYMBOLS
                                      ];
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
        const fen = `FEN:\n${wrapString(this.game.fen(), 60)}\n`;
        const moves = `Options to move:\n${wrapString(this.getMoves().join(" "), 60)}`;

        return `${fen}\nBoard:\n${boardLines}\n\n${moves}`;
    }
}

function asciiSub(
    patternAscii: string,
    replacementAscii: string,
    asciiLines: string[]
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
