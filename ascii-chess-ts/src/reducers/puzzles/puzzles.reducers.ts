import { ChessComPuzzleModel } from "../../models/ChessComPuzzleModel";
import { ChessComPuzzleViewModel } from "../../models/ChessComPuzzleViewModel";
import { createSlice } from "@reduxjs/toolkit";
import { LiChessPuzzleModel } from "../../models/LiChessPuzzleModel";
import { LiChessPuzzleViewModel } from "../../models/LiChessPuzzleViewModel";
import {
    fetchChessComDailyPuzzle,
    fetchLiChessDailyPuzzle,
} from "./puzzles.actions";

const chessComPuzzleInitialState: ChessComPuzzleModel = {
    puzzleTitle: "",
    puzzleUrl: "",
    publishTime: "",
    initialPuzzleFEN: "",
    solutionPgn: [],
    imageUrl: "",
    fetchStatus: {
        loading: false,
        error: null,
    },
};

const liChessPuzzleInitialState: LiChessPuzzleModel = {
    puzzleId: "",
    gameId: "",
    puzzleRating: "",
    puzzlePlays: 0,
    solution: [],
    themes: [],
    initialPuzzleFEN: "",
    fetchStatus: {
        loading: false,
        error: null,
    },
};

export const liChessPuzzleSlice = createSlice({
    name: "liChessPuzzle",
    initialState: liChessPuzzleInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLiChessDailyPuzzle.pending, (state) => {
                state.fetchStatus.loading = true;
                state.fetchStatus.error = null;
            })
            .addCase(fetchLiChessDailyPuzzle.fulfilled, (state, action) => {
                const { puzzle } = new LiChessPuzzleViewModel(action.payload);
                return puzzle;
            })
            .addCase(fetchLiChessDailyPuzzle.rejected, (state, action) => {
                state.fetchStatus.loading = false;
                state.fetchStatus.error = action?.error?.message;
            });
    },
});

export const chessComPuzzleSlice = createSlice({
    name: "chessComPuzzle",
    initialState: chessComPuzzleInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchChessComDailyPuzzle.pending, (state) => {
                state.fetchStatus.loading = true;
                state.fetchStatus.error = null;
            })
            .addCase(fetchChessComDailyPuzzle.fulfilled, (state, action) => {
                const viewModel = new ChessComPuzzleViewModel(action.payload)
                    .puzzle;
                state.fetchStatus.error = null;
                state.fetchStatus.loading = false;
                state.puzzleTitle = viewModel.puzzleTitle;
                state.puzzleUrl = viewModel.puzzleUrl;
                state.publishTime = viewModel.publishTime;
                state.initialPuzzleFEN = viewModel.initialPuzzleFEN;
                state.solutionPgn = viewModel.solutionPgn;
                state.imageUrl = viewModel.imageUrl;
            })
            .addCase(fetchChessComDailyPuzzle.rejected, (state, action) => {
                state.fetchStatus.loading = false;
                state.fetchStatus.error = action?.error?.message;
            });
    },
});
