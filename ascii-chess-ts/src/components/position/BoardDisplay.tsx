import React from "react";
import "./BoardDisplay.css";
import { BootstrapTheme } from "../controls/ThemeSelector";
import { processUnicodeChars, cleanChessPieceUnicode } from "../../utils";
import { createWhitePieceMapBySymbol } from "../../utils/chessDisplay";

interface BoardDisplayProps {
  board: string;
  theme: BootstrapTheme;
}

const BoardDisplay: React.FC<BoardDisplayProps> = ({ board, theme }) => {
  const rows: string[] = board.split("\n");

  const whitePieceMap = createWhitePieceMapBySymbol();

  const processChar = (char: string): React.ReactNode => {
    const cleanChar = cleanChessPieceUnicode(char);

    if ("♔♕♖♗♘♙".includes(cleanChar)) {
      return (
        <span key={Math.random()} style={{ color: "white" }}>
          {whitePieceMap[cleanChar]}
        </span>
      );
    }

    if ("♚♛♜♝♞♟".includes(cleanChar)) {
      return (
        <span key={Math.random()} style={{ color: "black" }}>
          {cleanChar}
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
    <div className="visualization-container board-display">
      <div
        className={`ascii-board ascii-board--${theme} p-4 rounded-lg font-mono text-3xl whitespace-pre overflow-x-auto w-full`}
      >
        {rows.map((row: string, i: number) => (
          <div key={i}>{processRow(row)}</div>
        ))}
      </div>
    </div>
  );
};

export default BoardDisplay;
