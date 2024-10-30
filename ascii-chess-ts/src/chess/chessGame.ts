import { Chess } from "chess.js";
export function asciiSub(
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
export function wrapString(str: string, maxLen: number) {
    const regex = new RegExp(`(.{1,${maxLen}})(\\s+|.{1,${maxLen}}$)`, "g");

    const matches = str.match(regex);
    if (matches) {
        return matches.join("\n");
    } else {
        return "";
    }
}

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
    public history() {
        return this.game.history();
    }

    public ascii() {
        return this.game.ascii();
    }
    public asciiView() {
        const asciiLines = this.game.ascii().split("\n");

        const boardLines = asciiSub("\\.", " ", [...asciiLines]);
        const maskedLines = asciiSub("[a-zA-Z]", "✱", [...boardLines]);

        const concatenatedBoard = boardLines
            .map((line, index) => {
                const paddedLine = line.padEnd(maskedLines[index].length, " ");
                return `${paddedLine} ${maskedLines[index]}`;
            })
            .join("\n");

        const fen = `FEN:\n${wrapString(this.game.fen(), 60)}\n`;
        const history = `History:\n${wrapString(this.game.history().join(" "), 60)}`;
        const moves = `Options to move:\n${wrapString(this.getMoves().join(" "), 60)}`;

        return `${fen}\nBoard:\n${concatenatedBoard}\n\n${history}\n\n${moves}`;
    }
}
