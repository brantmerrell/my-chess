import { useAppDispatch } from "../app/hooks";
import { RootState } from "../app/store";
import { useSelector } from "react-redux";
import React, { useState } from "react";
import {
    fetchChessComDailyPuzzle,
    fetchLiChessDailyPuzzle,
} from "../reducers/puzzles/puzzles.actions";

import "./SelectPosition.css";

const SelectPosition: React.FC = () => {
    const chessComPuzzle = useSelector<RootState>(
        (state) => state.chessComPuzzle
    );

    const dispatch = useAppDispatch();

    const [selectedOption, setSelectedOption] = useState("");

    const handleOptionChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedOption(event.target.value);
        if (event.target.value === "c.com-daily-puzzle") {
            dispatch(fetchChessComDailyPuzzle()).then(() => {
                console.log("fetchChessComDailyPuzzle action dispatched");
            });
        }
        if (event.target.value === "lichess-daily-puzzle") {
            dispatch(fetchLiChessDailyPuzzle()).then(() => {
                console.log("fetchChessComDailyPuzzle action dispatched");
            });
        }
    };

    return (
        <div>
            <select
                className="start-fen"
                value={selectedOption}
                onChange={handleOptionChange}
            >
                <option value="standard">Standard Starting Position</option>
                <option value="lichess-daily-puzzle">
                    Daily Lichess Puzzle
                </option>
                <option value="c.com-daily-puzzle">
                    Daily Chess.com Puzzle
                </option>
            </select>
        </div>
    );
};

export default SelectPosition;
