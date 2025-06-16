import React from "react";
import "./SelectPosition.css"
import { ChessComPuzzleViewModel } from "../models/ChessComPuzzleViewModel";
import { LiChessPuzzleViewModel } from "../models/LiChessPuzzleViewModel";
import { RootState, AppDispatch } from "../app/store";
import {
    fetchLiChessDailyPuzzle,
    fetchChessComDailyPuzzle,
} from "../reducers/puzzles/puzzles.actions";
import {
    loadFen,
    goToPosition,
} from "../reducers/positions/positions.reducers";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

enum SetupOptions {
    STANDARD = "standard",
    LICHESS_DAILY_PUZZLE = "lichess",
    CHESS_COM_DAILY_PUZZLE = "chesscom",
}

const SelectPosition: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const liChessPuzzle = useSelector(
        (state: RootState) => state.liChessPuzzle
    );
    const chessComPuzzle = useSelector(
        (state: RootState) => state.chessComPuzzle
    );
    const [selectedSetup, setSelectedSetup] = React.useState<string>(
        SetupOptions.STANDARD
    );

    const handleOptionChange = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = event.target.value;
        setSelectedSetup(value);

        if (value === SetupOptions.LICHESS_DAILY_PUZZLE) {
            const action = await dispatch(fetchLiChessDailyPuzzle());

            if (fetchLiChessDailyPuzzle.fulfilled.match(action)) {
                const puzzleResponse = action.payload;
                const puzzleData = new LiChessPuzzleViewModel(puzzleResponse)
                    .puzzle;

                // Load the complete game with setup history
                dispatch(
                    loadFen({
                        fen: puzzleData.setupHistory[0].fen,
                        setupHistory: puzzleData.setupHistory,
                    })
                );

                // Navigate to the initial puzzle position
                dispatch(goToPosition(puzzleResponse.puzzle.initialPly));
            }
        } else if (value === SetupOptions.CHESS_COM_DAILY_PUZZLE) {
            const action = await dispatch(fetchChessComDailyPuzzle());

            if (fetchChessComDailyPuzzle.fulfilled.match(action)) {
                const puzzleResponse = action.payload;
                const puzzleData = new ChessComPuzzleViewModel(puzzleResponse)
                    .puzzle;

                // Load the chess.com puzzle
                dispatch(
                    loadFen({
                        fen: puzzleData.initialPuzzleFEN,
                    })
                );
            }
        } else if (value === SetupOptions.STANDARD) {
            // Load standard starting position
            dispatch(
                loadFen({
                    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                })
            );
        }
    };

    return (
        <div className="position-layout">
            <select
                aria-label="Position Selection"
                className="dropdown-toggle position-select btn btn-secondary"
                value={selectedSetup}
                onChange={handleOptionChange}
                disabled={
                    liChessPuzzle.fetchStatus.loading ||
                    chessComPuzzle.fetchStatus.loading
                }
            >
                <option value={SetupOptions.STANDARD}>
                    Standard Starting Position
                </option>
                <option value={SetupOptions.LICHESS_DAILY_PUZZLE}>
                    {liChessPuzzle.fetchStatus.loading
                        ? "Loading..."
                        : "Daily Lichess Puzzle"}
                </option>
                <option value={SetupOptions.CHESS_COM_DAILY_PUZZLE}>
                    {chessComPuzzle.fetchStatus.loading
                        ? "Loading..."
                        : "Daily Chess.com Puzzle"}
                </option>
            </select>
        </div>
    );
};

export default SelectPosition;
