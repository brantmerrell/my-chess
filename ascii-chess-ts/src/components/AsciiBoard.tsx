import React, { useCallback, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { ChessComPuzzleModel } from "../models/ChessComPuzzleModel";
import { LiChessPuzzleModel } from "../models/LiChessPuzzleModel";
import { SetupOptions } from "../models/SetupOptions";
import { ChessGame } from "../chess/chessGame";
import SelectPosition from "./SelectPosition";

const AsciiBoard: React.FC = () => {
    const initialFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const [chessGame] = useState(() => new ChessGame(initialFen));
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
    const [board, setBoard] = useState(chessGame.asciiView());
    const [moves, setMoves] = useState<string[]>([]);
    const [selectedMove, setSelectedMove] = useState("");
    useEffect(() => {
        setBoard(chessGame.asciiView());
        updateMoves();
    }, [chessGame]);
    useEffect(() => {
        switch (selectedSetup) {
            case SetupOptions.STANDARD:
                setFen(initialFen);
                break;
            case SetupOptions.LICHESS_DAILY_PUZZLE:
                if (liChessPuzzle !== null) {
                    setFen(liChessPuzzle.initialPuzzleFEN);
                }
                break;
            case SetupOptions.CHESS_COM_DAILY_PUZZLE:
                if(chessComPuzzle !== null) {
                    setFen(chessComPuzzle.initialPuzzleFEN);
                }
                break;
            default:
                setFen(
                    initialFen
                ); 
        }
    }, [selectedSetup, liChessPuzzle, chessComPuzzle]); 

    const handleFenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFen(event.target.value);
    };
    const submitFen = () => {
        try {
            chessGame.loadFen(fen);
            setBoard(chessGame.asciiView());
            updateMoves();
        } catch (error) {
            console.error("Invalid FEN string");
        }
    };
    const submitMove = () => {
        try {
            chessGame.makeMove(selectedMove);
            setBoard(chessGame.asciiView());
            updateMoves();
            setSelectedMove("");
        } catch (error) {
            console.error("Error submitting move");
        }
    };

    const updateMoves = useCallback(() => {
        const legalMoves = chessGame.getMoves();
        setMoves(legalMoves);
    }, [chessGame]);

    const undoMove = () => {
        const move = chessGame.undo();
        if (move !== null) {
            setBoard(chessGame.asciiView());
            updateMoves();
        }
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
                            onChange={handleFenChange}
                        />
                        <button id="submitFen" onClick={submitFen}>
                            Submit FEN
                        </button>
                    </pre>
                </pre>
                <pre className="ascii-layout">
                    <pre id="board">{board}</pre>
                </pre>
                <div className="moves-layout">
                    <div className="moves-forward">
                        <select
                            id="selectedMove"
                            value={selectedMove}
                            onChange={(event) =>
                                setSelectedMove(event.target.value)
                            }
                        >
                            <option value="">Moves</option>
                            {moves.map((move, index) => (
                                <option key={index} value={move}>
                                    {move}
                                </option>
                            ))}
                        </select>
                        <input
                            id="move"
                            type="text"
                            value={selectedMove}
                            onChange={(event) =>
                                setSelectedMove(event.target.value)
                            }
                        />
                        <button id="submitMove" onClick={submitMove}>
                            Submit Move
                        </button>
                    </div>
                    <button id="undo" onClick={undoMove}>
                        Undo Move
                    </button>
                </div>
            </pre>
        </div>
    );
};

export default AsciiBoard;
