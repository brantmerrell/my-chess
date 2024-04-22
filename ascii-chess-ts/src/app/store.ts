import { configureStore } from "@reduxjs/toolkit";
import { ChessComPuzzleModel } from "../models/ChessComPuzzleModel";
import { LiChessPuzzleModel } from "../models/LiChessPuzzleModel";
import { SetupOptions } from "../models/SetupOptions";
import { chessGameSlice, ChessGameState } from "../reducers/positions/positions.reducers";
import {
    liChessPuzzleSlice,
    chessComPuzzleSlice,
} from "../reducers/puzzles/puzzles.reducers";
import { selectedSetupReducer } from "../reducers/setups/setups.reducers";

export const store = configureStore({
    reducer: {
        liChessPuzzle: liChessPuzzleSlice.reducer,
        chessComPuzzle: chessComPuzzleSlice.reducer,
        selectedSetup: selectedSetupReducer,
        chessGame: chessGameSlice.reducer,
    },
});

export type AppDispatch = typeof store.dispatch;

export interface RootState {
    liChessPuzzle: LiChessPuzzleModel | null; 
    chessComPuzzle: ChessComPuzzleModel | null;
    selectedSetup: SetupOptions.STANDARD;
    chessGame: ChessGameState;
}


export const { loadFen, makeMove, undoMove } = chessGameSlice.actions;
export default chessGameSlice.reducer;
