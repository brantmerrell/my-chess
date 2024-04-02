import { ChessComPuzzleModel } from "../../models/ChessComPuzzleModel";
import { ChessComPuzzleViewModel } from "../../models/ChessComPuzzleViewModel";
import { createSlice } from "@reduxjs/toolkit";
import { LiChessPuzzleModel } from "../../models/LiChessPuzzleModel";
import { LiChessPuzzleResponse } from "../../models/LiChessPuzzleResponse";
import { FOOT_FETCH_SUCCESS, FOOT_FETCH_FAILURE } from "./puzzles.actions";
import { fetchChessComDailyPuzzle } from "./puzzles.actions";

export interface ChessComPuzzleState {
    puzzle: ChessComPuzzleModel | null;
    loading: boolean;
    error: string | null;
}

const chessComPuzzleInitialState: ChessComPuzzleState = {
    puzzle: null,
    loading: false,
    error: null,
};

interface LiChessPuzzleState {
    liChessPuzzleModel: LiChessPuzzleModel | null;
    liChessPuzzleResponse: LiChessPuzzleResponse | null;
}

const initialState: LiChessPuzzleState = {
    liChessPuzzleModel: null,
    liChessPuzzleResponse: null,
};

export const liChessPuzzleReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case FOOT_FETCH_SUCCESS:
            return {
                liChessPuzzleModel: action.payload.liChessPuzzle,
                liChessPuzzleResponse: action.payload.liChessPuzzleResponse,
            };
        case FOOT_FETCH_FAILURE:
            return {
                liChessPuzzleModel: null,
                liChessPuzzleResponse: null,
            };
        default:
            return state;
    }
};

export const chessComPuzzleSlice = createSlice({
    name: "chessComPuzzle",
    initialState: chessComPuzzleInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(
                fetchChessComDailyPuzzle.pending,
                (state: ChessComPuzzleState) => {
                    state.loading = true;
                }
            )
            .addCase(fetchChessComDailyPuzzle.fulfilled, (state, action) => {
                state.loading = false;
                const viewModel = new ChessComPuzzleViewModel(action.payload); // Pass response
                state.puzzle = viewModel.puzzle;
                state.error = null;
            })
            .addCase(
                fetchChessComDailyPuzzle.rejected,
                (state: ChessComPuzzleState, action) => {
                    state.loading = false;
                    state.error = action.error.message!;
                }
            );
    },
});
