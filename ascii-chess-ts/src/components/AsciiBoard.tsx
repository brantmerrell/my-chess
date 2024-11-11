import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, loadFen, makeMove, undoMove } from "../app/store";
import { initialFen } from "../constants/env";
import { ChessComPuzzleModel } from "../models/ChessComPuzzleModel";
import { LiChessPuzzleModel } from "../models/LiChessPuzzleModel";
import { SetupOptions } from "../models/SetupOptions";
import { ChessGame } from "../chess/chessGame";
import { PieceDisplayMode } from "../types/chess";
import SelectPosition from "./SelectPosition";
import FenInput from "./FenInput";
import BoardDisplay from "./BoardDisplay";
import MoveControls from "./MoveControls";
import DisplayModeToggle from "./DisplayModeToggle";

interface AsciiBoardProps {
    displayMode: PieceDisplayMode;
    setDisplayMode: (mode: PieceDisplayMode) => void;
}

const AsciiBoard: React.FC<AsciiBoardProps> = ({
    displayMode,
    setDisplayMode,
}) => {
    const chessGameState = useSelector((state: RootState) => state.chessGame);
    const dispatch = useDispatch();
    const chessComPuzzle = useSelector<RootState, ChessComPuzzleModel | null>(
        (state) => state.chessComPuzzle
    );
    const selectedSetup = useSelector<RootState, string>(
        (state) => state.selectedSetup
    );
    const liChessPuzzle = useSelector<RootState, LiChessPuzzleModel | null>(
        (state) => state.liChessPuzzle
    );

    const [fen, setFen] = useState(initialFen);
    const [selectedMove, setSelectedMove] = useState("");
    const [undoMessage, setUndoMessage] = useState("");
    const [moveError, setMoveError] = useState("");

    useEffect(() => {
        dispatch(loadFen({ fen: initialFen }));
    }, [dispatch]);

    useEffect(() => {
        let newFen = initialFen;
        switch (selectedSetup) {
            case SetupOptions.LICHESS_DAILY_PUZZLE:
                if (liChessPuzzle?.initialPuzzleFEN) {
                    newFen = liChessPuzzle.initialPuzzleFEN;
                }
                break;
            case SetupOptions.CHESS_COM_DAILY_PUZZLE:
                if (chessComPuzzle?.initialPuzzleFEN) {
                    newFen = chessComPuzzle.initialPuzzleFEN;
                }
                break;
        }
        setFen(newFen);
    }, [selectedSetup, liChessPuzzle, chessComPuzzle]);

    const getCurrentBoard = () => {
        const game = new ChessGame(chessGameState.fen, displayMode);
        return game.asciiView();
    };

    const submitFen = () => {
        try {
            if (
                selectedSetup === SetupOptions.LICHESS_DAILY_PUZZLE &&
                liChessPuzzle?.setupHistory
            ) {
                dispatch(
                    loadFen({
                        fen: fen,
                        setupHistory: liChessPuzzle.setupHistory,
                    })
                );
            } else {
                dispatch(loadFen({ fen: fen }));
            }
            setMoveError("");
        } catch (error) {
            console.error("Invalid FEN position");
            setMoveError("Invalid FEN position");
        }
    };

    const submitMove = (move: string) => {
        if (!move.trim()) return;
        try {
            dispatch(makeMove(move));
            setSelectedMove("");
            setMoveError("");
        } catch (error) {
            console.error("Invalid move:", move);
            setMoveError(`Invalid move: ${move}`);
        }
    };

    const submitUndoMove = () => {
        if (chessGameState.history.length === 0) {
            setUndoMessage("No history to undo");
            setTimeout(() => setUndoMessage(""), 3000);
            return;
        }
        dispatch(undoMove());
    };

    return (
        <div>
            <pre className="chess-table">
                <SelectPosition />
                <FenInput
                    fen={fen}
                    onFenChange={setFen}
                    onSubmitFen={submitFen}
                />
                <BoardDisplay board={getCurrentBoard()} />
                <MoveControls
                    selectedMove={selectedMove}
                    availableMoves={chessGameState.moves}
                    onMoveChange={setSelectedMove}
                    onMoveSubmit={() => submitMove(selectedMove)}
                    onUndoMove={submitUndoMove}
                    undoMessage={undoMessage}
                    moveError={moveError}
                />
                <DisplayModeToggle
                    displayMode={displayMode}
                    onDisplayModeChange={setDisplayMode}
                />
            </pre>
        </div>
    );
};

export default AsciiBoard;
