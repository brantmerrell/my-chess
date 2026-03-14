import React, { useCallback } from "react";
import { useSelector } from "react-redux";
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
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import { setSelectedSetup } from "../../reducers/setups/setups.actions";
import { CUSTOM_SETUP_ID } from "../../models/SetupOptions";
import "./SetupMode.css";

export type SetupMode = "play" | "analysis";

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
  mode: SetupMode;
  onModeChange: (mode: SetupMode) => void;
}
const SetupModeComponent: React.FC<SetupModeProps> = ({
  theme,
  fen,
  setFen,
  submitFen,
  notification,
  clearNotification,
  mode,
  onModeChange,
}) => {
  const dispatch = useAppDispatch();
  const selectedSetup = useSelector((state: RootState) => state.selectedSetup);
  const { isAuthenticated, username, logout } = useLichessAuth();
  const { gameState, createSeek, startNewGame, resign } = useLichessGame();

  // When FEN is manually edited, switch to Custom mode (only if not already custom)
  const handleFenChange = useCallback((newFen: string) => {
    if (selectedSetup !== CUSTOM_SETUP_ID) {
      dispatch(setSelectedSetup(CUSTOM_SETUP_ID));
    }
    setFen(newFen);
  }, [dispatch, setFen, selectedSetup]);
  const handleQuickPairing = (timeControl: TimeControl) => {
    if (!isAuthenticated) {
      alert("Please log in with Lichess to play online");
      return;
    }
    const success = createSeek({
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
      <ModeTabs mode={mode} theme={theme} onModeChange={onModeChange} />
      {mode === "analysis" && (
        <div className="analysis-controls">
          <SelectPosition
            theme={theme}
            onCustomSelect={() => {
              const fenInput = document.getElementById("edit-string") as HTMLInputElement;
              fenInput?.focus();
            }}
          />
          <FenInput
            fen={fen}
            theme={theme}
            onFenChange={handleFenChange}
            onSubmitFen={submitFen}
            isCustomMode={selectedSetup === CUSTOM_SETUP_ID}
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
