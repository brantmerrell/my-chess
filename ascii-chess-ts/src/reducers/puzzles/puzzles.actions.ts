import { createAsyncThunk } from "@reduxjs/toolkit";
import { LiChessPuzzleResponse } from "../../models/LiChessPuzzleResponse";
import { getLiChessDailyPuzzle } from "../../services/lichess/lichess.service";

export const FOOT_FETCH_SUCCESS = "FOOT_FETCH_SUCCESS";
export const FOOT_FETCH_FAILURE = "FOOT_FETCH_FAILURE";

export const fetchLiChessPuzzle = createAsyncThunk<LiChessPuzzleResponse>(
    "puzzles/fetchLiChessPuzzle",
    () => {
        return getLiChessDailyPuzzle();
    }
)

