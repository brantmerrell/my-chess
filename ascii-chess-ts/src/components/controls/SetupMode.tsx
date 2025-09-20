import React, { useState } from 'react';
import SelectPosition from './SelectPosition';
import FenInput from './FenInput';
import { BootstrapTheme } from './ThemeSelector';
import { useLichessAuth } from '../../hooks/useLichessAuth';
import { useLichessGame } from '../../hooks/useLichessGame';
import { LichessGameLink } from '../LichessGameLink';
import { ConnectionStatus } from '../ConnectionStatus';
import './SetupMode.css';

type SetupMode = 'analysis' | 'play';

interface TimeControl {
  minutes: number;
  increment: number;
  label: string;
  category: 'rapid' | 'classical';
}

interface SetupModeProps {
  theme: BootstrapTheme;
  fen: string;
  setFen: (fen: string) => void;
  submitFen: () => void;
}

const SetupModeComponent: React.FC<SetupModeProps> = ({ theme, fen, setFen, submitFen }) => {
  const [mode, setMode] = useState<SetupMode>('analysis');
  const { isAuthenticated, username } = useLichessAuth();
  const { gameState, createSeek } = useLichessGame();

  const timeControls: TimeControl[] = [
    { minutes: 10, increment: 0, label: '10+0 Rapid', category: 'rapid' },
    { minutes: 10, increment: 5, label: '10+5 Rapid', category: 'rapid' },
    { minutes: 15, increment: 10, label: '15+10 Rapid', category: 'rapid' },
    { minutes: 30, increment: 0, label: '30+0 Classical', category: 'classical' },
    { minutes: 30, increment: 20, label: '30+20 Classical', category: 'classical' },
  ];

  const handleQuickPairing = async (timeControl: TimeControl) => {
    if (!isAuthenticated) {
      alert('Please log in with Lichess to play online');
      return;
    }

    const success = await createSeek({
      minutes: timeControl.minutes,
      increment: timeControl.increment
    });

    if (!success) {
      alert('Failed to create game. Please try again.');
    }
  };

  return (
    <div className="setup-mode-container">
      {/* Mode Selection Radio Buttons */}
      <div className="mode-selector">
        <label className={`radio-label ${theme}`}>
          <input
            type="radio"
            name="setup-mode"
            value="analysis"
            checked={mode === 'analysis'}
            onChange={() => setMode('analysis')}
          />
          <span>Analysis</span>
        </label>
        <label className={`radio-label ${theme}`}>
          <input
            type="radio"
            name="setup-mode"
            value="play"
            checked={mode === 'play'}
            onChange={() => setMode('play')}
          />
          <span>Play</span>
        </label>
      </div>

      {/* Analysis Mode Controls */}
      {mode === 'analysis' && (
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

      {/* Play Mode Controls */}
      {mode === 'play' && (
        <div className="play-controls">
          {!isAuthenticated ? (
            <div className="auth-required">
              <p>Please log in with Lichess to play online</p>
            </div>
          ) : (
            <>
              <div className="user-info">
                <span>Playing as: <strong>{username}</strong></span>
                <ConnectionStatus
                  connectionStatus={gameState.connectionStatus}
                  connectionError={gameState.connectionError}
                />
              </div>

              {/* Game Link */}
              {(gameState.gameUrl || gameState.gameId) && (
                <LichessGameLink
                  gameUrl={gameState.gameUrl}
                  gameId={gameState.gameId}
                  isPlaying={gameState.isPlaying}
                />
              )}

              {/* Game Status Display */}
              {gameState.isPlaying && (
                <div className="game-status">
                  <h4>🎯 Game Active</h4>
                  <p>Playing as {gameState.color} vs {gameState.opponentName}</p>
                  <p>Status: {gameState.status}</p>
                  {gameState.timeLeft && (
                    <div className="time-display">
                      <span>White: {Math.floor(gameState.timeLeft.white / 1000)}s</span>
                      <span>Black: {Math.floor(gameState.timeLeft.black / 1000)}s</span>
                    </div>
                  )}
                </div>
              )}

              {gameState.status === 'seeking' && (
                <div className="seeking-status">
                  <h4>🔍 Looking for opponent...</h4>
                  <p>Your seek is active on Lichess</p>
                </div>
              )}

              {!gameState.isPlaying && gameState.status !== 'seeking' && (
                <div className="quick-pairing">
                  <h4>Quick Pairing</h4>
                  <div className="time-control-buttons">
                    {timeControls.map((tc) => (
                      <button
                        key={tc.label}
                        className={`btn btn-${tc.category === 'rapid' ? 'info' : 'primary'} time-control-btn`}
                        onClick={() => handleQuickPairing(tc)}
                        disabled={gameState.status === 'seeking'}
                      >
                        {tc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SetupModeComponent;
