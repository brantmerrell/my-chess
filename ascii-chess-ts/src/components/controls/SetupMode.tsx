import React, { useState } from "react";
import SelectPosition from "./SelectPosition";
import FenInput from "./FenInput";
import ModeTabs from "./ModeTabs";
import TimeControlButtons, {
  TimeControl,
} from "../lichess-play/TimeControlButtons";
import GameStatus from "../lichess-play/GameStatus";
import GameResult from "../lichess-play/GameResult";
import UserInfo from "../lichess-play/UserInfo";
import { BootstrapTheme } from "./ThemeSelector";
import { useLichessAuth } from "../../hooks/useLichessAuth";
import { useLichessGame } from "../../contexts/LichessGameContext";
import { LichessGameLink } from "../lichess-play/LichessGameLink";
import LichessLogin from "../auth/LichessLogin";
import "./SetupMode.css";
type SetupMode = "analysis" | "play";
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
      <ModeTabs mode={mode} theme={theme} onModeChange={setMode} />
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
        <div className="play-controls" style={{ position: "relative" }}>
          {/* Temporary overlay - remove when Lichess play is production-ready */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              borderRadius: "5px",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "24px",
                  fontFamily: "monospace",
                  color: "#fff",
                }}
              >
                🚧 Coming Soon 🚧
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontFamily: "monospace",
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                Lichess integration is under development
              </p>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="auth-required">
              <LichessLogin />
            </div>
          ) : (
            <>
              <div className="play-status-row">
                <UserInfo
                  username={username}
                  connectionStatus={gameState.connectionStatus}
                  connectionError={gameState.connectionError}
                  onLogout={logout}
                />
                {!gameState.isPlaying &&
                  !gameState.gameId &&
                  !gameState.gameResult && (
                    <TimeControlButtons
                      onTimeControlSelect={handleQuickPairing}
                      disabled={gameState.status === "seeking"}
                    />
                  )}
              </div>
              {gameState.isPlaying && (
                <GameStatus
                  color={gameState.color}
                  opponentName={gameState.opponentName}
                  status={gameState.status}
                  timeLeft={gameState.timeLeft}
                  notification={notification.message ? notification : undefined}
                  onResign={handleResign}
                  onClearNotification={clearNotification}
                />
              )}
              {gameState.gameResult && !gameState.isPlaying && (
                <GameResult
                  result={gameState.gameResult.result}
                  reason={gameState.gameResult.reason}
                  onNewGame={startNewGame}
                />
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
