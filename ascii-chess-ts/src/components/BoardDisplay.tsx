import React from "react";
import './BoardDisplay.css';

interface BoardDisplayProps {
    board: string;
}

const BoardDisplay: React.FC<BoardDisplayProps> = ({ board }) => {
    return (
        <div className="board-display">
            <pre className="ascii-board">{board}</pre>
        </div>
    );
};

export default BoardDisplay;

