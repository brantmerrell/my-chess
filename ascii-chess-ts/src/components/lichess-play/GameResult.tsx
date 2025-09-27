import React from "react";

interface GameResultProps {
  result: 'win' | 'loss' | 'draw';
  reason: 'mate' | 'resign' | 'timeout' | 'draw' | 'stalemate' | 'insufficient' | 'abort' | 'unknown';
  onNewGame: () => void;
}

const GameResult: React.FC<GameResultProps> = ({ result, reason, onNewGame }) => {
  const reasonDisplayMap: Record<string, string> = {
    mate: "checkmate",
    resign: "resignation",
    timeout: "timeout",
    stalemate: "stalemate",
    draw: "agreement",
    abort: "abort",
    insufficient: "insufficient material",
    unknown: "unknown"
  };

  const getReasonDisplay = (reason: string): string => {
    return reasonDisplayMap[reason] || reason;
  };

  return (
    <div className="status-stack">
      <div className="game-result-compact">
        <span className="result-icon">🏁</span>
        <span className={`result-outcome ${result}`}>
          {result === "win" && "Won"}
          {result === "loss" && "Lost"}
          {result === "draw" && "Draw"}
        </span>
        <span className="result-reason">
          {getReasonDisplay(reason)}
        </span>
        <button
          className="btn btn-success btn-sm"
          onClick={onNewGame}
        >
          🎮 New Game
        </button>
      </div>
    </div>
  );
};

export default GameResult;