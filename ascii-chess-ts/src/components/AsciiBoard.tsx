import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, loadFen, makeMove, undoMove } from "../app/store";
import { initialFen } from "../constants/env";
import { ChessComPuzzleModel } from "../models/ChessComPuzzleModel";
import { LiChessPuzzleModel } from "../models/LiChessPuzzleModel";
import { SetupOptions } from "../models/SetupOptions";
import { ChessGame } from "../chess/chessGame";
import SelectPosition from "./SelectPosition";

const AsciiBoard: React.FC = () => {
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
        const game = new ChessGame(chessGameState.fen);
        return game.asciiView();
    };

    const submitFen = () => {
        try {
            if (selectedSetup === SetupOptions.LICHESS_DAILY_PUZZLE && liChessPuzzle?.setupHistory) {
                dispatch(loadFen({ 
                    fen: fen,
                    setupHistory: liChessPuzzle.setupHistory
                }));
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
                <pre className="fen-layout">
                    <SelectPosition />
                    <pre id="horiz">
                        <input
                            id="edit-string"
                            type="text"
                            value={fen}
                            onChange={(e) => setFen(e.target.value)}
                            aria-label="FEN Input"
                        />
                        <button id="submitFen" onClick={submitFen}>
                            Submit FEN
                        </button>
                    </pre>
                </pre>

                <pre className="ascii-layout">
                    <pre id="board">{getCurrentBoard()}</pre>
                </pre>

                <div className="moves-layout">
                    <div className="moves-forward">
                        <select
                            id="selectedMove"
                            value={selectedMove}
                            onChange={(e) => setSelectedMove(e.target.value)}
                        >
                            <option value="">Moves</option>
                            {chessGameState.moves.map((move, index) => (
                                <option key={index} value={move}>
                                    {move}
                                </option>
                            ))}
                        </select>

                        <input
                            id="move"
                            type="text"
                            value={selectedMove}
                            onChange={(e) => setSelectedMove(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    submitMove(selectedMove);
                                }
                            }}
                            aria-label="Move Input"
                        />

                        <button
                            id="submitMove"
                            onClick={() => submitMove(selectedMove)}
                        >
                            Submit Move
                        </button>
                    </div>

                    <button id="undo" onClick={submitUndoMove}>
                        Undo Move
                    </button>
                    {undoMessage && (
                        <div
                            className="undo-message"
                            style={{ color: "red", marginTop: "10px" }}
                        >
                            {undoMessage}
                        </div>
                    )}
                    {moveError && (
                        <div
                            className="move-error"
                            style={{ color: "red", marginTop: "10px" }}
                        >
                            {moveError}
                        </div>
                    )}
                </div>
            </pre>
        </div>
    );
};

export default AsciiBoard;
