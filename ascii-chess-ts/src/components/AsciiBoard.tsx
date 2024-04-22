import React, { useCallback, useState, useEffect } from "react";
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
                if (chessComPuzzle !== null) {
                    setFen(chessComPuzzle.initialPuzzleFEN);
                }
                break;
            default:
                setFen(initialFen);
        }
    }, [selectedSetup, liChessPuzzle, chessComPuzzle]);

    const handleFenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFen(event.target.value);
    };
    const submitFen = () => {
        dispatch(loadFen(fen));
    };
    const submitMove = () => {
        dispatch(makeMove(selectedMove));
        setSelectedMove('');
    };

    const updateMoves = useCallback(() => {
        setMoves(chessGameState.moves);  
    }, [chessGameState.moves]); 

    const submitUndoMove = () => {
        dispatch(undoMove()); 
        setBoard(chessGameState.fen);  
        updateMoves();  
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
                    <button id="undo" onClick={submitUndoMove}>
                        Undo Move
                    </button>
                </div>
            </pre>
        </div>
    );
};

export default AsciiBoard;
