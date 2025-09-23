import React, { useState } from "react";
import SelectPosition from "./SelectPosition";
import FenInput from "./FenInput";
import { BootstrapTheme } from "./ThemeSelector";
import { useLichessAuth } from "../../hooks/useLichessAuth";
import { useLichessGame } from "../../contexts/LichessGameContext";
import { LichessGameLink } from "../LichessGameLink";
import { ConnectionStatus } from "../ConnectionStatus";
import LichessLogin from "../auth/LichessLogin";
import "./SetupMode.css";
type SetupMode = "analysis" | "play";
interface TimeControl {
  minutes: number;
  increment: number;
  label: string;
  category: "rapid" | "classical";
}
interface SetupModeProps {
  theme: BootstrapTheme;
  fen: string;
  setFen: (fen: string) => void;
  submitFen: () => void;
  notification: {
    message: string;
    type: "error" | "warning" | "success" | "info";
  };
  clearNotification: () => void;
}
const SetupModeComponent: React.FC<SetupModeProps> = ({
  theme,
  fen,
  setFen,
  submitFen,
  notification,
  clearNotification,
}) => {
  const [mode, setMode] = useState<SetupMode>("analysis");
  const { isAuthenticated, username, logout } = useLichessAuth();
  const { gameState, createSeek, startNewGame, resign } = useLichessGame();

  const reasonDisplayMap: Record<string, string> = {
    mate: "checkmate",
    resign: "resignation",
    timeout: "timeout",
    stalemate: "stalemate",
    draw: "agreement",
    abort: "abort",
  };

  const getReasonDisplay = (reason: string): string => {
    return reasonDisplayMap[reason] || reason;
  };
  const timeControls: TimeControl[] = [
    { minutes: 10, increment: 0, label: "10+0 Rapid", category: "rapid" },
    { minutes: 10, increment: 5, label: "10+5 Rapid", category: "rapid" },
    { minutes: 15, increment: 10, label: "15+10 Rapid", category: "rapid" },
    {
      minutes: 30,
      increment: 0,
      label: "30+0 Classical",
      category: "classical",
    },
    {
      minutes: 30,
      increment: 20,
      label: "30+20 Classical",
      category: "classical",
    },
  ];
  const handleQuickPairing = async (timeControl: TimeControl) => {
    if (!isAuthenticated) {
      alert("Please log in with Lichess to play online");
      return;
    }
    const success = await createSeek({
      minutes: timeControl.minutes,
      increment: timeControl.increment,
    });
    if (!success) {
      alert("Failed to create game. Please try again.");
    }
  };
  const handleResign = async () => {
    if (window.confirm("Are you sure you want to resign this game?")) {
      await resign();
    }
  };
  return (
    <div className="setup-mode-container">
      <div className="mode-tabs">
        <button
          className={`tab ${mode === "analysis" ? "active" : ""} ${theme}`}
          onClick={() => setMode("analysis")}
        >
          Custom
        </button>
        <button
          className={`tab ${mode === "play" ? "active" : ""} ${theme}`}
          onClick={() => setMode("play")}
        >
          Lichess
        </button>
      </div>
      {mode === "analysis" && (
        <div className="analysis-controls">
          <SelectPosition theme={theme} setFen={setFen} />
          <FenInput
            fen={fen}
            theme={theme}
            onFenChange={setFen}
            onSubmitFen={submitFen}
          />
        </div>
      )}
      {mode === "play" && (
        <div className="play-controls">
          {!isAuthenticated ? (
            <div className="auth-required">
              <LichessLogin />
            </div>
          ) : (
            <>
              <div className="play-status-row">
                <div className="user-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>
                      Playing as: <strong>{username}</strong>
                    </span>
                    <button
                      onClick={logout}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#c82333';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc3545';
                      }}
                    >
                      Logout
                    </button>
                  </div>
                  <ConnectionStatus
                    connectionStatus={gameState.connectionStatus}
                    connectionError={gameState.connectionError}
                  />
                </div>
                {!gameState.isPlaying &&
                  !gameState.gameId &&
                  !gameState.gameResult && (
                    <div className="quick-pairing">
                      <span className="quick-pairing-label">Quick Pairing:</span>
                      <div className="time-control-buttons">
                        {timeControls.map((tc) => (
                          <button
                            key={tc.label}
                            className={`btn btn-${tc.category === "rapid" ? "info" : "primary"} time-control-btn`}
                            onClick={() => handleQuickPairing(tc)}
                            disabled={gameState.status === "seeking"}
                          >
                            {tc.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
              {gameState.isPlaying && (
                <div className="status-stack">
                    <div className="game-status-compact">
                      <span className="game-active">🟢 Active</span>
                      <span>
                        {gameState.color} vs {gameState.opponentName}
                      </span>
                      <span>{gameState.status}</span>
                  {gameState.timeLeft && (
                    <div className="time-display">
                      <span>
                        White: {Math.floor(gameState.timeLeft.white / 1000)}s
                      </span>
                      <span>
                        Black: {Math.floor(gameState.timeLeft.black / 1000)}s
                      </span>
                      <button
                        className="btn btn-danger time-control-btn"
                        onClick={handleResign}
                        style={{
                          fontSize: "13px",
                          padding: "6px 10px",
                          marginLeft: "20px",
                        }}
                      >
                        🏳️ Resign
                      </button>
                      {notification.message && (
                        <span
                          style={{
                            marginLeft: "20px",
                            fontSize: "14px",
                            fontFamily: "monospace",
                          }}
                        >
                          <span style={{ marginRight: "6px" }}>
                            {notification.type === "error" && "✾"}
                            {notification.type === "warning" && "‼"}
                            {notification.type === "success" && "🗸"}
                            {notification.type === "info" && "🛈"}
                          </span>
                          <span>{notification.message}</span>
                          <button
                            onClick={clearNotification}
                            title="Clear notification"
                            style={{
                              background: "none",
                              border: "none",
                              marginLeft: "8px",
                              cursor: "pointer",
                              fontSize: "14px",
                              opacity: 0.7,
                            }}
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                    </div>
                </div>
              )}
              {gameState.gameResult && !gameState.isPlaying && (
                <div className="status-stack">
                    <div className="game-result-compact">
                      <span className="result-icon">🏁</span>
                      <span
                        className={`result-outcome ${gameState.gameResult.result}`}
                      >
                        {gameState.gameResult.result === "win" && "Won"}
                        {gameState.gameResult.result === "loss" && "Lost"}
                        {gameState.gameResult.result === "draw" && "Draw"}
                      </span>
                      <span className="result-reason">
                        {getReasonDisplay(gameState.gameResult.reason)}
                      </span>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={startNewGame}
                      >
                        🎮 New Game
                      </button>
                    </div>
                </div>
              )}
              {gameState.status === "seeking" &&
                !gameState.isPlaying &&
                !gameState.gameResult && (
                  <div className="seeking-status-compact">
                    <span>🔍 Looking for opponent...</span>
                  </div>
                )}
              {gameState.status === "starting" && !gameState.isPlaying && (
                <div className="seeking-status-compact">
                  <span>⏳ Game starting...</span>
                </div>
              )}
              {(gameState.gameUrl || gameState.gameId) && (
                  <LichessGameLink
                    gameUrl={gameState.gameUrl}
                    gameId={gameState.gameId}
                    isPlaying={gameState.isPlaying}
                  />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default SetupModeComponent;
