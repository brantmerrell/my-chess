import React, { useState, useEffect } from 'react';
import { ChessGame } from '../chess/chessLogic';

const ChessBoard: React.FC = () => {

    const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const [chessGame] = useState(new ChessGame(initialFen));
    const [fen, setFen] = useState(initialFen);
    const [board, setBoard] = useState(chessGame.ascii());
    const [moves, setMoves] = useState<string[]>([]);
    const [selectedMove, setSelectedMove] = useState('');
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
    const submitMove = () => {
        try {
            chessGame.makeMove(selectedMove);
            setBoard(chessGame.ascii());
            updateMoves();
            setSelectedMove('');
        } catch (error) {
            console.error("Error submitting move");
        }
    };

    const updateMoves = () => {
        const legalMoves = chessGame.getMoves();
        setMoves(legalMoves);
    };
    const undoMove = () => {
        const move = chessGame.undo();
        if (move !== null) {
            setBoard(chessGame.ascii());
            updateMoves();
        }
    };

    return (
        <div>
            <input type="text" value={fen} onChange={handleFenChange} />
            <button onClick={submitFen}>Submit FEN</button>
            <pre>{board}</pre>
            <select value={selectedMove} onChange={(event) => setSelectedMove(event.target.value)}>
                <option value="">Select a move</option>
                {moves.map((move, index) => (
                    <option key={index} value={move}>{move}</option>
                ))}
            </select>
            <input type="text" value={selectedMove} onChange={(event) => setSelectedMove(event.target.value)} />
            <button onClick={submitMove}>Submit Move</button>
            <button onClick={undoMove}>Undo Move</button>
        </div>
    );
};

export default ChessBoard;

