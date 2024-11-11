import React from "react";

interface BoardDisplayProps {
    board: string;
}

const BoardDisplay: React.FC<BoardDisplayProps> = ({ board }) => {
    return (
        <pre className="ascii-layout">
            <pre id="board">{board}</pre>
        </pre>
    );
};

export default BoardDisplay;
