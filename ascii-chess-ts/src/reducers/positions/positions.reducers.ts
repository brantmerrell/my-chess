import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChessGame } from "../../chess/chessGame";
import { Position } from "../../types/chess";
import { STANDARD_FEN } from "../../models/SetupOptions";

export interface ChessGameState {
    fen: string;
    moves: string[];
    history: string[];
    positions: Position[];
    currentPositionIndex: number;
}

interface LoadFenPayload {
    fen: string;
    setupHistory?: Position[];
}

const initialGameState: ChessGameState = {
    fen: STANDARD_FEN,
    moves: [],
    history: [],
    positions: [
        {
            ply: 0,
            san: "-",
            uci: "-",
            fen: STANDARD_FEN,
        },
    ],
    currentPositionIndex: 0,
};

const createGameFromState = (state: ChessGameState): ChessGame => {
    const game = new ChessGame(state.positions[0].fen);
    state.positions.slice(1).forEach((pos) => {
        const moveText = pos.san.replace(/^\d+\.\.?\.?/, "").trim();
        game.makeMove(moveText);
    });
    return game;
};

const createGameUpToIndex = (state: ChessGameState, index: number): ChessGame => {
    const game = new ChessGame(state.positions[0].fen);
    for (let i = 1; i <= index; i++) {
        if (i < state.positions.length) {
            const moveText = state.positions[i].san.replace(/^\d+\.\.?\.?/, "").trim();
            game.makeMove(moveText);
        }
    }
    return game;
};

export const chessGameSlice = createSlice({
    name: "chessGame",
    initialState: initialGameState,
    reducers: {
        loadFen(state, action: PayloadAction<LoadFenPayload>) {
            try {
                const game = new ChessGame();

                if (action.payload.setupHistory) {
                    state.positions = action.payload.setupHistory;
                    state.fen = action.payload.fen;
                    state.history = action.payload.setupHistory
                        .filter((pos: Position) => pos.san !== "-")
                        .map((pos: Position) =>
                            pos.san.replace(/^\d+\.\.?\.?/, "").trim()
                        );

                    state.positions.slice(1).forEach((pos: Position) => {
                        const moveText = pos.san
                            .replace(/^\d+\.\.?\.?/, "")
                            .trim();
                        game.makeMove(moveText);
                    });
                } else {
                    game.loadFen(action.payload.fen);
                    state.fen = action.payload.fen;
                    state.history = [];
                    state.positions = [
                        {
                            ply: 0,
                            san: "-",
                            uci: "-",
                            fen: action.payload.fen,
                        },
                    ];
                }

                state.moves = game.getMoves();
                state.currentPositionIndex = state.positions.length - 1;
            } catch (error) {
                console.error("Invalid FEN string or move history", error);
                throw error;
            }
        },
        makeMove(state, action) {
            try {
                const game = createGameFromState(state);
                // we need memory to store a history of SAN, UCI, FEN so we don't need to reconstruct a new game from starting position for each makeMove
                game.makeMove(action.payload);

                const newFen = game.toFen();
                const [, activeColor, , , , fullmoveStr] = state.fen.split(" ");
                const moveNumber = parseInt(fullmoveStr);
                const formattedSan =
                    activeColor === "w"
                        ? `${moveNumber}.${action.payload}`
                        : `${moveNumber}...${action.payload}`;

                state.fen = newFen;
                state.moves = game.getMoves();
                state.history.push(action.payload);
                state.positions.push({
                    ply: state.positions.length,
                    san: formattedSan,
                    uci: game.getLastUCI(),
                    fen: newFen,
                });
                state.currentPositionIndex = state.positions.length - 1;
            } catch (error) {
                console.error("Error submitting move", error);
                throw error;
            }
        },
        undoMove(state) {
            if (state.history.length > 0 && state.positions.length > 1) {
                state.history.pop();
                state.positions.pop();
                const previousPosition =
                    state.positions[state.positions.length - 1];
                state.fen = previousPosition.fen;

                const game = createGameFromState(state);
                // we need memory to store a history of SAN, UCI, FEN so we don't need to reconstruct a new game from starting position for each undoMove
                state.moves = game.getMoves();
                state.currentPositionIndex = state.positions.length - 1; // Update index after undo
            }
        },
        // New navigation actions
        goToPosition(state, action: PayloadAction<number>) {
            const index = action.payload;
            if (index >= 0 && index < state.positions.length) {
                state.currentPositionIndex = index;
                const game = createGameUpToIndex(state, index);
                state.fen = state.positions[index].fen;
                state.moves = game.getMoves();
            }
        },
        goForward(state) {
            if (state.currentPositionIndex < state.positions.length - 1) {
                state.currentPositionIndex++;
                const game = createGameUpToIndex(state, state.currentPositionIndex);
                state.fen = state.positions[state.currentPositionIndex].fen;
                state.moves = game.getMoves();
            }
        },
        goBackward(state) {
            if (state.currentPositionIndex > 0) {
                state.currentPositionIndex--;
                const game = createGameUpToIndex(state, state.currentPositionIndex);
                state.fen = state.positions[state.currentPositionIndex].fen;
                state.moves = game.getMoves();
            }
        },
    },
});

