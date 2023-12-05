import React, { useState } from 'react';
import { ChessGame } from '../chess/chessLogic';

const ChessBoard: React.FC = () => {
    const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const [chessGame] = useState(new ChessGame(initialFen));
    const [fen, setFen] = useState(initialFen);
    const [board, setBoard] = useState(chessGame.ascii());

    const handleFenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFen(event.target.value);
    };

    const submitFen = () => {
        try {
            chessGame.loadFen(fen);
            setBoard(chessGame.ascii());
        } catch (error) {
            console.error("Invalid FEN string");
        }
    };

    return (
        <div>
            <input type="text" value={fen} onChange={handleFenChange} />
            <button onClick={submitFen}>Submit FEN</button>
            <pre>{board}</pre>
            {/* Additional UI for move submission and undo */}
        </div>
    );
};

export default ChessBoard;

