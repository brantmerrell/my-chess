import { createAsyncThunk } from "@reduxjs/toolkit";
import { LiChessPuzzleResponse } from "../../models/LiChessPuzzleResponse";
import { ChessComPuzzleResponse } from "../../models/ChessComPuzzleResponse";
import {
    getLiChessDailyPuzzle,
} from "../../services/lichess/lichess.service";
import { getChessComDailyPuzzle } from "../../services/chesscom/chesscom.service";

export const FOOT_FETCH_SUCCESS = "FOOT_FETCH_SUCCESS";
export const FOOT_FETCH_FAILURE = "FOOT_FETCH_FAILURE";

export const fetchLiChessDailyPuzzle = createAsyncThunk<LiChessPuzzleResponse>(
    "puzzles/fetchLiChessDailyPuzzle",
    () => {
        return getLiChessDailyPuzzle();
    }
);

export const fetchChessComDailyPuzzle = createAsyncThunk<ChessComPuzzleResponse>(
  'puzzles/fetchChessComDailyPuzzle',
  async () => {
    const puzzle = await getChessComDailyPuzzle();
    return puzzle;
  }
);
