import React from "react";
import { PieceDisplayMode } from "../types/chess";
import { useChessGame } from "../hooks/useChessGame";
import { ChessGame } from "../chess/chessGame";
import SelectPosition from "./SelectPosition";
import FenInput from "./FenInput";
import BoardDisplay from "./BoardDisplay";
import MoveControls from "./MoveControls";
import PieceViewSelector from "./PieceViewSelector";

interface AsciiBoardProps {
    displayMode: PieceDisplayMode;
    setDisplayMode: (mode: PieceDisplayMode) => void;
}

const AsciiBoard: React.FC<AsciiBoardProps> = ({
    displayMode,
    setDisplayMode,
}) => {
    const {
        fen,
        setFen,
        currentPosition,
        submitFen,
    } = useChessGame(displayMode);

    const getCurrentBoard = () => {
        const game = new ChessGame(currentPosition, displayMode);
        return game.asciiView();
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
                    displayMode={displayMode}
                />
                <PieceViewSelector
                    displayMode={displayMode}
                    onDisplayModeChange={setDisplayMode}
                />
            </pre>
        </div>
    );
};

export default AsciiBoard;


