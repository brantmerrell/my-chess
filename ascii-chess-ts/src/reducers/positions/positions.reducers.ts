import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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

interface LoadFenPayload {
    fen: string;
    setupHistory?: {
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
        loadFen(state, action: PayloadAction<LoadFenPayload>) {
            try {
                const newGame = new ChessGame();
                
                if (action.payload.setupHistory) {
                    state.positions = action.payload.setupHistory;
                    state.fen = action.payload.fen;
                    state.history = action.payload.setupHistory
                        .filter(pos => pos.san !== "-")
                        .map(pos => pos.san.replace(/^\d+\.\.?\.?/, '').trim());
                    
                    state.positions.slice(1).forEach(pos => {
                        const moveText = pos.san.replace(/^\d+\.\.?\.?/, '').trim();
                        newGame.makeMove(moveText);
                    });
                } else {
                    newGame.loadFen(action.payload.fen);
                    state.fen = action.payload.fen;
                    state.history = [];
                    state.positions = [{
                        ply: 0,
                        san: "-",
                        uci: "-",
                        fen: action.payload.fen,
                    }];
                }
                
                state.moves = newGame.getMoves();
            } catch (error) {
                console.error("Invalid FEN string or move history", error);
            }
        },
        makeMove(state, action) {
            try {
                const newGame = new ChessGame();
                
                state.positions.slice(1).forEach(pos => {
                    const moveText = pos.san.replace(/^\d+\.\.?\.?/, '').trim();
                    newGame.makeMove(moveText);
                });
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
                    uci: newGame.getLastUCI(),
                    fen: newFen,
                });
            } catch (error) {
                console.error("Error submitting move", error);
                throw error;
            }
        },
        undoMove(state) {
            if (state.history.length > 0 && state.positions.length > 1) {
                const newGame = new ChessGame();
                state.history.pop();
                state.positions.pop();
                state.positions.slice(1).forEach(pos => {
                    const moveText = pos.san.replace(/^\d+\.\.?\.?/, '').trim();
                    newGame.makeMove(moveText);
                });
                const previousPosition = state.positions[state.positions.length - 1];
                state.fen = previousPosition.fen;
                state.moves = newGame.getMoves();
            }
        },
    },
});
