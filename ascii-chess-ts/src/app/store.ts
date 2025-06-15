import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { chessGameSlice } from "../reducers/positions/positions.reducers";
import {
    liChessPuzzleSlice,
    chessComPuzzleSlice,
} from "../reducers/puzzles/puzzles.reducers";
import { selectedSetupReducer } from "../reducers/setups/setups.reducers";

const rootReducer = combineReducers({
    chessGame: chessGameSlice.reducer,
    liChessPuzzle: liChessPuzzleSlice.reducer,
    chessComPuzzle: chessComPuzzleSlice.reducer,
    selectedSetup: selectedSetupReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

export const {
    loadFen,
    makeMove,
    undoMove,
    goToPosition,
    goForward,
    goBackward,
} = chessGameSlice.actions;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
