import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChessGame } from "../../chess/chessGame";
import { Position } from "../../types/chess";
import { STANDARD_FEN } from "../../models/SetupOptions";

const MOVE_NUMBER_PREFIX = /^\d+\.\.?\.?/;

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

// Every Position stores its FEN, which fully determines the legal moves,
// so positions can be restored directly instead of replaying the game.
const movesFromFen = (fen: string): string[] => new ChessGame(fen).getMoves();

const goToIndex = (state: ChessGameState, index: number) => {
  state.currentPositionIndex = index;
  state.fen = state.positions[index].fen;
  state.moves = movesFromFen(state.fen);
};

export const chessGameSlice = createSlice({
  name: "chessGame",
  initialState: initialGameState,
  reducers: {
    loadFen(state, action: PayloadAction<LoadFenPayload>) {
      try {
        if (action.payload.setupHistory) {
          state.positions = action.payload.setupHistory;
          state.history = action.payload.setupHistory
            .filter((pos: Position) => pos.san !== "-")
            .map((pos: Position) =>
              pos.san.replace(MOVE_NUMBER_PREFIX, "").trim(),
            );
        } else {
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

        state.fen = action.payload.fen;
        state.moves = movesFromFen(action.payload.fen);
        state.currentPositionIndex = state.positions.length - 1;
      } catch (error) {
        console.error("Invalid FEN string or move history", error);
        throw error;
      }
    },
    makeMove(state, action) {
      try {
        // Moves always apply to the latest position, even when the user has
        // navigated to an earlier one.
        const baseFen = state.positions[state.positions.length - 1].fen;
        const game = new ChessGame(baseFen);
        game.makeMove(action.payload);

        const newFen = game.toFen();
        const [, activeColor, , , , fullmoveStr] = baseFen.split(" ");
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
        goToIndex(state, state.positions.length - 1);
      }
    },
    goToPosition(state, action: PayloadAction<number>) {
      const index = action.payload;
      if (index >= 0 && index < state.positions.length) {
        goToIndex(state, index);
      }
    },
    goForward(state) {
      if (state.currentPositionIndex < state.positions.length - 1) {
        goToIndex(state, state.currentPositionIndex + 1);
      }
    },
    goBackward(state) {
      if (state.currentPositionIndex > 0) {
        goToIndex(state, state.currentPositionIndex - 1);
      }
    },
  },
});
