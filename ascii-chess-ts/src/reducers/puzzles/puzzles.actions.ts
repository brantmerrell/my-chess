import { createAsyncThunk } from "@reduxjs/toolkit";
import { LiChessPuzzleResponse } from "../../models/LiChessPuzzleResponse";
import { ChessComPuzzleResponse } from "../../models/ChessComPuzzleResponse";
import { getLiChessDailyPuzzle } from "../../services/lichess/lichess.service";
import { getChessComDailyPuzzle } from "../../services/chesscom/chesscom.service";

export const fetchLiChessDailyPuzzle = createAsyncThunk<LiChessPuzzleResponse>(
    "puzzles/fetchLiChessDailyPuzzle",
    async () => {
        return getLiChessDailyPuzzle();
    }
);

export const fetchChessComDailyPuzzle =
    createAsyncThunk<ChessComPuzzleResponse>(
        "puzzles/fetchChessComDailyPuzzle",
        async () => {
            const puzzle = await getChessComDailyPuzzle();
            return puzzle;
        }
    );
