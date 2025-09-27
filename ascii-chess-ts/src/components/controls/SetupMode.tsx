import React, { useState } from "react";
import SelectPosition from "./SelectPosition";
import FenInput from "./FenInput";
import ModeTabs from "./ModeTabs";
import TimeControlButtons, { TimeControl } from "./TimeControlButtons";
import GameStatus from "./GameStatus";
import GameResult from "./GameResult";
import UserInfo from "./UserInfo";
import { BootstrapTheme } from "./ThemeSelector";
import { useLichessAuth } from "../../hooks/useLichessAuth";
import { useLichessGame } from "../../contexts/LichessGameContext";
import { LichessGameLink } from "../LichessGameLink";
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
      <ModeTabs
        mode={mode}
        theme={theme}
        onModeChange={setMode}
      />
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
