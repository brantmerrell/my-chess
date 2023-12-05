import React, { useState, useEffect } from 'react';
import { ChessGame } from '../chess/chessLogic';

const ChessBoard: React.FC = () => {
    const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const [chessGame] = useState(new ChessGame(initialFen));
    const [fen, setFen] = useState(initialFen);
    const [board, setBoard] = useState(chessGame.ascii());
    const [moves, setMoves] = useState<string[]>([]);

    useEffect(() => {
        setBoard(chessGame.ascii());
        updateMoves();
    }, [chessGame]);

    const handleFenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFen(event.target.value);
    };

    const submitFen = () => {
        try {
            chessGame.loadFen(fen);
            setBoard(chessGame.ascii());
            updateMoves();
        } catch (error) {
            console.error("Invalid FEN string");
        }
    };

    const updateMoves = () => {
        const legalMoves = chessGame.getMoves(); // Assume this method exists and returns a string array of moves
        setMoves(legalMoves);
    };

    return (
        <div>
            <input type="text" value={fen} onChange={handleFenChange} />
            <button onClick={submitFen}>Submit FEN</button>
            <pre>{board}</pre>
            <select>
                {moves.map((move, index) => (
                    <option key={index} value={move}>{move}</option>
                ))}
            </select>
        </div>
    );
};

export default ChessBoard;

