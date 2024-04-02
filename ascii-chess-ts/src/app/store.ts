import { configureStore } from "@reduxjs/toolkit"; //configureStore is preferred over createStore with Redux Toolkit
import { liChessPuzzleReducer, chessComPuzzleSlice } from "../reducers/puzzles/puzzles.reducers";
export const store = configureStore({
    reducer: {
        liChessPuzzle: liChessPuzzleReducer,
        chessComPuzzle: chessComPuzzleSlice.reducer,
    },
});

export type AppDispatch = typeof store.dispatch;

export interface RootState {
    chessComPuzzle: any; 
}
