import React from "react";
import "./BoardDisplay.css";

interface BoardDisplayProps {
    board: string;
}

const BoardDisplay: React.FC<BoardDisplayProps> = ({ board }) => {
    const rows: string[] = board.split("\n");

    const whitePieceMap: { [key: string]: string } = {
        '♔': '♚',
        '♕': '♛',
        '♖': '♜',
        '♗': '♝',
        '♘': '♞',
        '♙': '♟',
    };

    const processChar = (char: string): React.ReactNode => {
        if ("♔♕♖♗♘♙".includes(char)) {
            return (
                <span
                    key={Math.random()}
                    style={{ color: "white" }}
                >
                    {whitePieceMap[char]}
                </span>
            );
        }
        return char;
    };

    const processRow = (row: string): React.ReactNode[] => {
        return Array.from(row).map((char, i) => (
            <React.Fragment key={i}>{processChar(char)}</React.Fragment>
        ));
    };

    return (
        <div className="board-display">
            <div className="ascii-board bg-blue-200 p-4 rounded-lg font-mono text-3xl whitespace-pre overflow-x-auto w-full">
                {rows.map((row: string, i: number) => (
                    <div key={i}>{processRow(row)}</div>
                ))}
            </div>
        </div>
    );
};

export default BoardDisplay;

