import React from "react";
import "./BoardDisplay.css";
import { BootstrapTheme } from "./ThemeSelector";
import { processUnicodeChars, cleanChessPieceUnicode } from "../utils";

interface BoardDisplayProps {
    board: string;
    theme: BootstrapTheme;
}

const BoardDisplay: React.FC<BoardDisplayProps> = ({ board, theme }) => {
    const rows: string[] = board.split("\n");

    const whitePieceMap: { [key: string]: string } = {
        [cleanChessPieceUnicode('♔')]: cleanChessPieceUnicode('♚'),
        [cleanChessPieceUnicode('♕')]: cleanChessPieceUnicode('♛'),
        [cleanChessPieceUnicode('♖')]: cleanChessPieceUnicode('♜'),
        [cleanChessPieceUnicode('♗')]: cleanChessPieceUnicode('♝'),
        [cleanChessPieceUnicode('♘')]: cleanChessPieceUnicode('♞'),
        [cleanChessPieceUnicode('♙')]: cleanChessPieceUnicode('♟'),
    };

    const processChar = (char: string): React.ReactNode => {
        const cleanChar = cleanChessPieceUnicode(char);
        const whitePieces = Object.keys(whitePieceMap);

        if (whitePieces.includes(cleanChar)) {
            return (
                <span
                    key={Math.random()}
                    style={{ color: "white" }}
                >
                    {whitePieceMap[cleanChar]}
                </span>
            );
        }
        return cleanChar;
    };

    const processRow = (row: string): React.ReactNode[] => {
        return processUnicodeChars(row).map((char, i) => (
            <React.Fragment key={i}>{processChar(char)}</React.Fragment>
        ));
    };

    return (
        <div className="board-display">
            <div className={`ascii-board ascii-board--${theme} p-4 rounded-lg font-mono text-3xl whitespace-pre overflow-x-auto w-full`}>
                {rows.map((row: string, i: number) => (
                    <div key={i}>{processRow(row)}</div>
                ))}
            </div>
        </div>
    );
};

export default BoardDisplay;

