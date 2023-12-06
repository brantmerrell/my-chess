import React, { useCallback, useState, useEffect } from 'react';
import { ChessGame } from '../chess/chessLogic';

const ChessBoard: React.FC = () => {

    const initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const [chessGame] = useState(() => new ChessGame(initialFen));

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

    const updateMoves = useCallback(() => {
        const legalMoves = chessGame.getMoves();
        setMoves(legalMoves);
    }, [chessGame]);
    const undoMove = () => {
        const move = chessGame.undo();
        if (move !== null) {
            setBoard(chessGame.ascii());
            updateMoves();
        }
    };

    return (
        <div>
            <pre className="fen-layout">
                <input id="edit-string" type="text" value={fen} onChange={handleFenChange} />
                <button id="submit" onClick={submitFen}>Submit FEN</button>
            </pre>
            <pre className="ascii-layout">
                <pre id="txt">
                    {board}
                </pre>
            </pre>
            <div className="moves-layout">
                <select id="selectedMove" value={selectedMove} onChange={(event) => setSelectedMove(event.target.value)}>
                    <option value="">Moves</option>
                    {moves.map((move, index) => (
                        <option key={index} value={move}>{move}</option>
                    ))}
                </select>
                <input id="move" type="text" value={selectedMove} onChange={(event) => setSelectedMove(event.target.value)} />
                <button id="submitMove" onClick={submitMove}>Submit Move</button>
                <button id="undo" onClick={undoMove}>Undo Move</button>
            </div>
        </div>
    );
};

export default ChessBoard;

