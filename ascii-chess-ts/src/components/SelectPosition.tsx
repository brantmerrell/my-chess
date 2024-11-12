import { useSelector } from "react-redux";
import React from "react";
import { useAppDispatch } from "../app/hooks";
import { RootState } from "../app/store";
import { SetupOptions } from "../models/SetupOptions";
import {
    fetchChessComDailyPuzzle,
    fetchLiChessDailyPuzzle,
} from "../reducers/puzzles/puzzles.actions";
import { setSelectedSetup } from "../reducers/setups/setups.actions";

import "./SelectPosition.css";

const SelectPosition: React.FC = () => {
    const dispatch = useAppDispatch();
    const selectedSetup = useSelector(
        (state: RootState) => state.selectedSetup
    );

    const handleOptionChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        dispatch(setSelectedSetup(event.target.value));
        if (event.target.value === SetupOptions.CHESS_COM_DAILY_PUZZLE) {
            dispatch(fetchChessComDailyPuzzle());
        }
        if (event.target.value === SetupOptions.LICHESS_DAILY_PUZZLE) {
            dispatch(fetchLiChessDailyPuzzle());
        }
    };

    return (
        <div className="fen-layout">
            <select
                aria-label="Position Selection"
                className="start-fen"
                value={selectedSetup}
                onChange={handleOptionChange}
            >
                <option value={SetupOptions.STANDARD}>
                    Standard Starting Position
                </option>
                <option value={SetupOptions.LICHESS_DAILY_PUZZLE}>
                    Daily Lichess Puzzle
                </option>
                <option value={SetupOptions.CHESS_COM_DAILY_PUZZLE}>
                    Daily Chess.com Puzzle
                </option>
            </select>
        </div>
    );
};

export default SelectPosition;
