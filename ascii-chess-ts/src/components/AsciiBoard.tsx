import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { PieceDisplayMode } from "../types/chess";
import { useChessGame } from "../hooks/useChessGame";
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
    const {
        fen,
        setFen,
        selectedMove,
        setSelectedMove,
        undoMessage,
        moveError,
        getCurrentBoard,
        submitFen,
        submitMove,
        submitUndoMove,
    } = useChessGame(displayMode);

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
                    availableMoves={useSelector(
                        (state: RootState) => state.chessGame.moves
                    )}
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
