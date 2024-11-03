import { createSlice } from "@reduxjs/toolkit";
import { ChessGame } from "../../chess/chessGame";
import { Chess, Move } from "chess.js";

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
                const newGame = new Chess(action.payload);
                state.fen = action.payload;
                state.moves = newGame.moves();
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
                const newGame = new Chess(state.fen);
                const move = newGame.move(action.payload);
                
                if (!move) {
                    throw new Error("Invalid move");
                }

                const newFen = newGame.fen();
                const [, activeColor, , , , fullmoveStr] = state.fen.split(" ");
                const moveNumber = parseInt(fullmoveStr);

                const formattedSan = activeColor === "w" 
                    ? `${moveNumber}.${action.payload}`
                    : `${moveNumber}...${action.payload}`;

                const uciMove = `${move.from}${move.to}${move.promotion || ''}`;

                state.fen = newFen;
                state.moves = newGame.moves();
                state.history.push(action.payload);
                state.positions.push({
                    ply: state.positions.length,
                    san: formattedSan,
                    uci: uciMove,
                    fen: newFen,
                });
            } catch (error) {
                console.error("Error submitting move");
            }
        },
        undoMove(state) {
            if (state.history.length > 0 && state.positions.length > 1) {
                state.history.pop();
                state.positions.pop();
                const previousPosition = state.positions[state.positions.length - 1];
                state.fen = previousPosition.fen;
                const newGame = new Chess(previousPosition.fen);
                state.moves = newGame.moves();
            }
        },
    },
});
