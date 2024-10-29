import { createSlice } from "@reduxjs/toolkit";
import { ChessGame } from "../../chess/chessGame";

export interface ChessGameState {
    fen: string;
    moves: string[];
    history: string[];
    positions: {
        ply: number;
        san: string;
        uci: string;
        fen: string;
    }[];
}

const initialGameState: ChessGameState = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: [],
    history: [],
    positions: [
        {
            ply: 0,
            san: "-",
            uci: "-",
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        },
    ],
};
export const chessGameSlice = createSlice({
    name: "chessGame",
    initialState: initialGameState,
    reducers: {
        loadFen(state, action) {
            try {
                const newGame = new ChessGame(action.payload);
                state.fen = action.payload;
                state.moves = newGame.getMoves();
                state.history = [];
                state.positions = [
                    {
                        ply: 0,
                        san: "-",
                        uci: "-",
                        fen: action.payload,
                    },
                ];
            } catch (error) {
                console.error("Invalid FEN string");
            }
        },
        makeMove(state, action) {
            try {
                const newGame = new ChessGame(state.fen);
                newGame.makeMove(action.payload);
                const newFen = newGame.toFen();

                const [, activeColor, , , , fullmoveStr] = state.fen.split(" ");
                const moveNumber = parseInt(fullmoveStr);
                const formattedSan =
                    activeColor === "w"
                        ? `${moveNumber}.${action.payload}`
                        : `${moveNumber}...${action.payload}`;

                state.fen = newFen;
                state.moves = newGame.getMoves();
                state.history.push(action.payload);
                state.positions.push({
                    ply: state.positions.length,
                    san: formattedSan,
                    uci: "-",
                    fen: newFen,
                });
            } catch (error) {
                console.error("Error submitting move");
            }
        },
        undoMove(state) {
            if (state.history.length > 0) {
                const newGame = new ChessGame(state.fen);
                newGame.undo();
                state.fen = newGame.toFen();
                state.moves = newGame.getMoves();
                state.history.pop();
                state.positions.pop();
            }
        },
    },
});
